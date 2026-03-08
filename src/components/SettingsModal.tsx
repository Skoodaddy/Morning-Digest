import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, X } from 'lucide-react';

export interface SectionConfig {
  id: string;
  visible: boolean;
  title: string;
}

interface SettingsModalProps {
  sections: SectionConfig[];
  setSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>;
  onClose: () => void;
}

const SortableItem: React.FC<{ section: SectionConfig, onToggle: (id: string) => void }> = ({ section, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-white/5 mb-2">
      <div className="flex items-center">
        <button {...attributes} {...listeners} className="cursor-grab p-1 mr-2 text-zinc-500 hover:text-white transition-colors">
          <GripVertical className="w-5 h-5" />
        </button>
        <span className={`text-sm font-medium ${section.visible ? 'text-zinc-200' : 'text-zinc-500 line-through'}`}>
          {section.title}
        </span>
      </div>
      <button onClick={() => onToggle(section.id)} className={`p-2 rounded-lg transition-colors ${section.visible ? 'text-indigo-400 hover:bg-indigo-400/10' : 'text-zinc-500 hover:bg-zinc-700'}`}>
        {section.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
      </button>
    </div>
  );
}

const SettingsModal: React.FC<SettingsModalProps> = ({ sections, setSections, onClose }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleVisibility = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-medium text-white">Customize Digest</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-zinc-400 mb-4">Drag to reorder sections. Tap the eye icon to show or hide a section.</p>
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {sections.map(section => (
                  <SortableItem key={section.id} section={section} onToggle={toggleVisibility} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
