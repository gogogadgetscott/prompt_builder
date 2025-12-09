import React, { useState } from 'react';
import type { Recipe } from '../RecipeSelector/RecipeSelector';
import './Settings.css';

interface Props {
    recipes: Recipe[];
    onSave: (recipes: Recipe[]) => void;
    onClose: () => void;
}

export const Settings: React.FC<Props> = ({ recipes, onSave, onClose }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editTemplate, setEditTemplate] = useState('');

    const handleEdit = (r: Recipe) => {
        setEditingId(r.id);
        setEditLabel(r.label);
        setEditCategory(r.category || '');
        setEditTemplate(r.template);
    };

    const handleAddNew = () => {
        const newId = Date.now().toString();
        setEditingId(newId);
        setEditLabel('New Recipe');
        setEditCategory('');
        setEditTemplate('');
    };

    const handleSaveEdit = () => {
        if (!editingId) return;

        if (recipes.find(r => r.id === editingId)) {
            // Update existing
            const updated = recipes.map(r => r.id === editingId ? { ...r, label: editLabel, category: editCategory, template: editTemplate } : r);
            onSave(updated);
        } else {
            // Add new
            const newRecipe: Recipe = { id: editingId, label: editLabel, category: editCategory, template: editTemplate };
            onSave([...recipes, newRecipe]);
        }
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this recipe?')) {
            onSave(recipes.filter(r => r.id !== id));
        }
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleExport = () => {
        const data = JSON.stringify(recipes, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gemini_recipes_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
                    // Simple validation: check if items look like recipes
                    const valid = json.every(r => r.id && r.label && r.template);
                    if (valid) {
                        if (confirm(`Import ${json.length} recipes? This will append to your current list.`)) {
                            // Merge strategy: Append with new IDs to avoid collision or keep IDs?
                            // Let's keep IDs but filter out exact ID matches to avoid duplicate keys error
                            // actually simpler: just append and if ID exists, maybe suffix it? 
                            // OR just filter out existing IDs from import


                            // For simplicity: We will just concat everything. 
                            // React/Keys might complain if duplicate IDs. 
                            // Let's regenerate IDs for imported items to be safe
                            const imported = json.map((r: Recipe) => ({ ...r, id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }));

                            onSave([...recipes, ...imported]);
                            alert('Recipes imported successfully!');
                        }
                    } else {
                        alert('Invalid recipe file format.');
                    }
                } else {
                    alert('Invalid JSON: Expected an array.');
                }
            } catch (err) {
                console.error(err);
                alert('Failed to parse JSON.');
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2>Manage Recipes</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <label className="action-btn-secondary">
                        Import
                        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </label>
                    <button onClick={handleExport} className="action-btn-secondary">Export</button>
                    <button onClick={onClose} className="close-btn">Done</button>
                </div>
            </div>

            <div className="settings-content">
                {editingId ? (
                    <div className="editor-form">
                        <div className="form-group">
                            <label>Label</label>
                            <input
                                value={editLabel}
                                onChange={e => setEditLabel(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                value={editCategory}
                                onChange={e => setEditCategory(e.target.value)}
                                placeholder="e.g. Editing, Email, Coding"
                            />
                        </div>
                        <div className="form-group">
                            <label>Template</label>
                            <textarea
                                value={editTemplate}
                                onChange={e => setEditTemplate(e.target.value)}
                                placeholder="Enter prompt template..."
                            />
                        </div>
                        <div className="form-actions">
                            <button onClick={handleSaveEdit} className="save-btn" disabled={!editLabel || !editTemplate}>Save</button>
                            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="recipe-list">
                            {recipes.map(r => (
                                <div key={r.id} className="recipe-item">
                                    <span className="recipe-name">{r.label}</span>
                                    <div className="item-actions">
                                        <button onClick={() => handleEdit(r)} className="icon-btn">Edit</button>
                                        <button onClick={() => handleDelete(r.id)} className="icon-btn delete">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddNew} className="add-new-btn">+ Add New Recipe</button>
                    </>
                )}
            </div>
        </div>
    );
};
