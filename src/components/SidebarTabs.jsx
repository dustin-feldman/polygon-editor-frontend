// components/SidebarTabs.jsx
import { useState } from "react";

const tabs = ["Thumbnails", "Tree", "Table"];

export default function SidebarTabs() {
  const [activeTab, setActiveTab] = useState("Thumbnails");

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex border-b bg-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              activeTab === tab
                ? "bg-white border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-2 text-sm">
        {activeTab === "Thumbnails" && (
          <div>
            <p className="text-gray-600">Page 1</p>
            <div className="bg-gray-200 h-24 mb-2 rounded">[Thumbnail]</div>
            <p className="text-gray-600">Page 2</p>
            <div className="bg-gray-200 h-24 mb-2 rounded">[Thumbnail]</div>
          </div>
        )}
        {activeTab === "Tree" && (
          <ul className="list-disc pl-4">
            <li>Page 1
              <ul className="list-circle pl-4">
                <li>Polygon #3</li>
                <li>Polygon #4 (Locked)</li>
              </ul>
            </li>
            <li>Page 2
              <ul className="list-circle pl-4">
                <li>Polygon #9</li>
              </ul>
            </li>
          </ul>
        )}
        {activeTab === "Table" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Page</th>
                <th className="border px-2 py-1">Area</th>
                <th className="border px-2 py-1">Label</th>
                <th className="border px-2 py-1">Locked</th>
                <th className="border px-2 py-1">Color</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">#3</td>
                <td className="border px-2 py-1">1</td>
                <td className="border px-2 py-1">122.4</td>
                <td className="border px-2 py-1">Region A</td>
                <td className="border px-2 py-1">No</td>
                <td className="border px-2 py-1 text-red-500">🔴</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">#4</td>
                <td className="border px-2 py-1">1</td>
                <td className="border px-2 py-1">321.5</td>
                <td className="border px-2 py-1">No Spray</td>
                <td className="border px-2 py-1">Yes</td>
                <td className="border px-2 py-1 text-green-500">🟢</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">#9</td>
                <td className="border px-2 py-1">2</td>
                <td className="border px-2 py-1">98.7</td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1">No</td>
                <td className="border px-2 py-1 text-blue-500">🔵</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
