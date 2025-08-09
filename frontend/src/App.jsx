import { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex justify-center items-center h-screen">
      <Button variant="destructive" onClick={() => setCount(count + 1)}>
        Click me
      </Button>
      <p>{count}</p>
    </div>
  );
}

export default App;
