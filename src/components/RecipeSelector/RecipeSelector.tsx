import React, { useState, useMemo } from 'react';
import './RecipeSelector.css';

export interface Recipe {
    id: string;
    label: string;
    category?: string;
    icon?: string; // Placeholder
    template: string;
}

interface Props {
    recipes: Recipe[];
    onSelect: (template: string, recipeName: string) => void;
}

export const RecipeSelector: React.FC<Props> = ({ recipes, onSelect }) => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Extract categories
    const categories = useMemo(() => {
        const cats = new Set(recipes.map(r => r.category || 'General'));
        return ['All', ...Array.from(cats).sort()];
    }, [recipes]);

    // Filter recipes
    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => {
            const matchesSearch = r.label.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = activeCategory === 'All' || (r.category || 'General') === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [recipes, search, activeCategory]);

    return (
        <div className="recipe-selector">
            <div className="rs-header">
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rs-search"
                />
            </div>

            <div className="rs-tabs">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`rs-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="rs-grid">
                {filteredRecipes.map((r) => (
                    <button
                        key={r.id}
                        className="rs-card"
                        onClick={() => onSelect(r.template, r.label)}
                        title={r.template}
                    >
                        <span className="rs-label">{r.label}</span>
                    </button>
                ))}
                {filteredRecipes.length === 0 && (
                    <div className="rs-empty">No recipes found.</div>
                )}
            </div>
        </div>
    );
};
