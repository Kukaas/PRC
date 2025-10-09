import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { api } from '@/services/api';
import PrivateLayout from '@/layout/PrivateLayout';
import CustomForm from '@/components/CustomForm';
import CustomInput from '@/components/CustomInput';

const Maintenance = () => {
    const [activeTab, setActiveTab] = useState('skills');
    const [skills, setSkills] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', isActive: true });

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Load data only once on component mount
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [skillsResponse, servicesResponse] = await Promise.all([
                api.maintenance.getSkills(),
                api.maintenance.getServices()
            ]);
            setSkills(skillsResponse.data || []);
            setServices(servicesResponse.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Memoized filtered data based on current tab and filters
    const filteredData = useMemo(() => {
        const data = activeTab === 'skills' ? skills : services;

        return data.filter(item => {
            const matchesSearch = !searchTerm ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = !statusFilter ||
                (statusFilter === 'active' && item.isActive) ||
                (statusFilter === 'inactive' && !item.isActive);

            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [activeTab, skills, services, searchTerm, statusFilter]);

    const handleCreate = async (e) => {
        e.preventDefault(); // Prevent form submission and page reload

        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        try {
            if (activeTab === 'skills') {
                const response = await api.maintenance.createSkill({ name: formData.name.trim() });
                // Add the new skill to the existing skills array
                const newSkill = response.data?.data || response.data;
                setSkills(prevSkills => [...prevSkills, newSkill]);
            } else {
                const response = await api.maintenance.createService({ name: formData.name.trim() });
                // Add the new service to the existing services array
                const newService = response.data?.data || response.data;
                setServices(prevServices => [...prevServices, newService]);
            }

            toast.success(`${activeTab === 'skills' ? 'Skill' : 'Service'} created successfully`);
            setIsCreateDialogOpen(false);
            setFormData({ name: '', isActive: true });
        } catch (error) {
            console.error('Error creating item:', error);
            toast.error(error.response?.data?.message || 'Failed to create item');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault(); // Prevent form submission and page reload

        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        try {
            if (activeTab === 'skills') {
                const response = await api.maintenance.updateSkill(editingItem._id, {
                    name: formData.name.trim(),
                    isActive: formData.isActive
                });
                // Update the skill in the existing skills array
                const updatedSkill = response.data?.data || response.data;
                setSkills(prevSkills =>
                    prevSkills.map(skill =>
                        skill._id === editingItem._id ? updatedSkill : skill
                    )
                );
            } else {
                const response = await api.maintenance.updateService(editingItem._id, {
                    name: formData.name.trim(),
                    isActive: formData.isActive
                });
                // Update the service in the existing services array
                const updatedService = response.data?.data || response.data;
                setServices(prevServices =>
                    prevServices.map(service =>
                        service._id === editingItem._id ? updatedService : service
                    )
                );
            }

            toast.success(`${activeTab === 'skills' ? 'Skill' : 'Service'} updated successfully`);
            setIsEditDialogOpen(false);
            setEditingItem(null);
            setFormData({ name: '', isActive: true });
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error(error.response?.data?.message || 'Failed to update item');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            return;
        }

        try {
            if (activeTab === 'skills') {
                await api.maintenance.deleteSkill(item._id);
                // Remove the skill from the existing skills array
                setSkills(prevSkills => prevSkills.filter(skill => skill._id !== item._id));
            } else {
                await api.maintenance.deleteService(item._id);
                // Remove the service from the existing services array
                setServices(prevServices => prevServices.filter(service => service._id !== item._id));
            }

            toast.success(`${activeTab === 'skills' ? 'Skill' : 'Service'} deleted successfully`);
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error(error.response?.data?.message || 'Failed to delete item');
        }
    };

    const openEditDialog = (item) => {
        setEditingItem(item);
        setFormData({ name: item.name, isActive: item.isActive });
        setIsEditDialogOpen(true);
    };

    const openCreateDialog = () => {
        setFormData({ name: '', isActive: true });
        setIsCreateDialogOpen(true);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
    };

    if (loading) {
        return (
            <PrivateLayout>
                <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </PrivateLayout>
        );
    }

    return (
        <PrivateLayout>
            <div className="min-h-screen bg-blue-50">
                {/* Main Content */}
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800">System Maintenance</h1>
                        <Button
                            onClick={openCreateDialog}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add {activeTab === 'skills' ? 'Skill' : 'Service'}
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-white p-1 rounded-lg w-fit shadow-sm">
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'skills'
                                ? 'bg-cyan-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Skills Management
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'services'
                                ? 'bg-cyan-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Services Management
                        </button>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Search className="w-4 h-4 inline mr-1" />
                                    Search
                                </label>
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Filter className="w-4 h-4 inline mr-1" />
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Filter Summary */}
                        <div className="mt-3 pt-3 border-t border-cyan-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-cyan-700">
                                    Showing {filteredData.length} of {activeTab === 'skills' ? skills.length : services.length} {activeTab}
                                </span>
                                <div className="flex gap-2 text-xs">
                                    {searchTerm && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Search: {searchTerm}</span>}
                                    {statusFilter && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Status: {statusFilter}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Content */}
                    {filteredData.length === 0 ? (
                        <div className="bg-cyan-500 rounded-lg p-6">
                            <div className="text-center text-white">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-lg font-medium">
                                    {(() => {
                                        const isSkillsEmpty = activeTab === 'skills' ? skills.length === 0 : services.length === 0;
                                        return isSkillsEmpty
                                            ? `No ${activeTab} found`
                                            : 'No items match your filters';
                                    })()}
                                </p>
                                <p className="text-cyan-100 text-sm mt-2">
                                    {activeTab === 'skills' ? skills.length === 0 : services.length === 0
                                        ? `Create your first ${activeTab === 'skills' ? 'skill' : 'service'} to get started`
                                        : 'Try adjusting your search criteria or clearing filters'
                                    }
                                </p>
                                {(() => {
                                    const isDataEmpty = activeTab === 'skills' ? skills.length === 0 : services.length === 0;
                                    return isDataEmpty ? (
                                        <button
                                            onClick={openCreateDialog}
                                            className="mt-3 bg-white text-cyan-600 px-4 py-2 rounded-md hover:bg-cyan-50 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2 inline" />
                                            Add {activeTab === 'skills' ? 'Skill' : 'Service'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={clearFilters}
                                            className="mt-3 bg-white text-cyan-600 px-4 py-2 rounded-md hover:bg-cyan-50 transition-colors"
                                        >
                                            Clear All Filters
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-cyan-500 text-white px-6 py-4">
                                <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                                    <div>Name</div>
                                    <div>Status</div>
                                    <div>Created Date</div>
                                    <div>Actions</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-gray-200">
                                {filteredData.map((item) => (
                                    <div key={item?._id || Math.random()} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="grid grid-cols-4 gap-4 text-sm items-center">
                                            <div className="font-medium text-gray-900 truncate" title={item?.name || 'Unknown'}>
                                                {item?.name || 'Unknown'}
                                            </div>
                                            <div>
                                                <Badge
                                                    variant={item?.isActive ? 'default' : 'secondary'}
                                                    className={item?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                                                >
                                                    {item?.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="text-gray-600">
                                                {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditDialog(item)}
                                                    className="hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(item)}
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Footer */}
                            <div className="bg-gray-50 px-6 py-3 border-t">
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Total {activeTab}: {activeTab === 'skills' ? skills.length : services.length}</span>
                                    <div className="flex gap-4">
                                        <span>Active: {filteredData.filter(item => item.isActive).length}</span>
                                        <span>Inactive: {filteredData.filter(item => !item.isActive).length}</span>
                                        <span>Filtered: {filteredData.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New {activeTab === 'skills' ? 'Skill' : 'Service'}</DialogTitle>
                    </DialogHeader>
                    <CustomForm onSubmit={handleCreate}>
                        <CustomInput
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={`Enter ${activeTab === 'skills' ? 'skill' : 'service'} name`}
                            required
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                                Create
                            </Button>
                        </div>
                    </CustomForm>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit {activeTab === 'skills' ? 'Skill' : 'Service'}</DialogTitle>
                    </DialogHeader>
                    <CustomForm onSubmit={handleEdit}>
                        <CustomInput
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={`Enter ${activeTab === 'skills' ? 'skill' : 'service'} name`}
                            required
                        />
                        <div className="flex items-center space-x-2 mt-4">
                            <Switch
                                id="active"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700">
                                Active
                            </label>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                                Update
                            </Button>
                        </div>
                    </CustomForm>
                </DialogContent>
            </Dialog>
        </PrivateLayout>
    );
};

export default Maintenance;
