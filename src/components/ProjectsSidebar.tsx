import { useState } from "react";
import { ChevronLeft, ChevronRight, Leaf, Droplet, Sprout, Bus } from "lucide-react";

const projects = [
  { id: 1, name: "Solar Energy", icon: Leaf },
  { id: 2, name: "Water Conservation", icon: Droplet },
  { id: 3, name: "Urban Farming", icon: Sprout },
  { id: 4, name: "Eco Transport", icon: Bus },
];

export const ProjectsSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-black/40 border-r-2 border-primary/50 p-5 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && <h2 className="text-xl font-semibold text-primary">Sustainable Projects</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-primary hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
      </div>
      
      <ul className="space-y-2">
        {projects.map((project) => {
          const Icon = project.icon;
          return (
            <li
              key={project.id}
              className="flex items-center gap-3 p-3 border-b border-white/10 cursor-pointer hover:text-primary hover:scale-105 transition-all"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{project.name}</span>}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
