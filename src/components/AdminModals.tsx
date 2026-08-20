import React, { useState } from 'react';
import { Field, Skill, RoadmapStep } from '../types';
import { X, Plus, Trash2, Edit2, Check, Save } from 'lucide-react';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skillData: Partial<Skill>) => void;
  fields: Field[];
  initialData?: Skill | null;
}

export const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fields,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fieldId, setFieldId] = useState(initialData?.field_id || fields[0]?.id || '');
  const [icon, setIcon] = useState(initialData?.icon || 'S');
  const [bgColor, setBgColor] = useState(initialData?.bg_color || '#6c5ce7');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'Beginner');
  const [avgDays, setAvgDays] = useState(initialData?.avg_days || '3 days');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialData?.id || `skill-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      description: description.trim(),
      field_id: fieldId,
      icon: icon.trim() || name.slice(0, 2).toUpperCase(),
      bg_color: bgColor,
      difficulty,
      avg_days: avgDays,
      order_index: initialData?.order_index || 1,
      learner_count: initialData?.learner_count || 1,
      step_count: initialData?.step_count || 3
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#1a1c2e] mb-4 sm:mb-6 pr-8">
          {initialData ? 'Edit Skill Track' : 'Add New Skill Track'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Skill Name</label>
            <input 
              type="text" 
              className="field-input" 
              placeholder="e.g. TypeScript, Docker, Flutter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Short Description</label>
            <textarea 
              className="field-input min-h-[70px]" 
              placeholder="Brief description of this roadmap..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row2">
            <div>
              <label className="field-label">Parent Field</label>
              <select 
                className="field-input"
                value={fieldId || ''}
                onChange={(e) => setFieldId(e.target.value)}
              >
                {fields.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Difficulty</label>
              <select 
                className="field-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="row2">
            <div>
              <label className="field-label">Icon Badge (1-2 chars)</label>
              <input 
                type="text" 
                className="field-input" 
                maxLength={3}
                placeholder="e.g. TS, PY"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Badge Color</label>
              <input 
                type="color" 
                className="field-input h-[46px] p-1 cursor-pointer" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>

          <div className="btn-row pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Skill' : 'Create Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface FieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fieldData: Partial<Field>) => void;
  initialData?: Field | null;
}

export const FieldModal: React.FC<FieldModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState(initialData?.icon || '💻');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialData?.id || `field-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim() || '💻'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md p-5 sm:p-7 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#1a1c2e] mb-4 pr-8">
          {initialData ? 'Edit Field / Category' : 'Add New Field / Category'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Field Name</label>
            <input 
              type="text" 
              className="field-input" 
              placeholder="e.g. Artificial Intelligence, Mobile Apps"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea 
              className="field-input min-h-[70px]" 
              placeholder="Brief overview of this field..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Icon / Emoji</label>
            <input 
              type="text" 
              className="field-input" 
              maxLength={4}
              placeholder="e.g. 🤖, 📱"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>

          <div className="btn-row pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Field' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepData: Partial<RoadmapStep>) => void;
  skillId: string;
  skillName: string;
  nextOrder: number;
}

export const StepModal: React.FC<StepModalProps> = ({
  isOpen,
  onClose,
  onSave,
  skillId,
  skillName,
  nextOrder
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceLink, setResourceLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: `step-${skillId}-${Date.now()}`,
      skill_id: skillId,
      title: title.trim(),
      description: description.trim(),
      step_order: nextOrder,
      resource_link: resourceLink.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md p-5 sm:p-7 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#1a1c2e] mb-1 pr-8">
          Add Roadmap Step
        </h3>
        <p className="text-xs text-[#8a8ca3] mb-6">For {skillName} (Step #{nextOrder})</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Step Title</label>
            <input 
              type="text" 
              className="field-input" 
              placeholder="e.g. Learn Semantic HTML"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Topics / Concepts</label>
            <textarea 
              className="field-input min-h-[80px]" 
              placeholder="e.g. header, nav, main, footer, article tags..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Documentation / Guide URL (Optional)</label>
            <input 
              type="url" 
              className="field-input" 
              placeholder="https://..."
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
            />
          </div>

          <div className="btn-row pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex1 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
