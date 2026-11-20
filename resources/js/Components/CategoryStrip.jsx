import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, Disc, ShieldAlert, Wind, Flame, GitCommit, ChevronRight } from 'lucide-react';

const iconMap = {
    Disc: Disc,
    ShieldAlert: ShieldAlert,
    Wind: Wind,
    Flame: Flame,
    GitCommit: GitCommit,
};

export default function CategoryStrip({ categories = [] }) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="category-strip">
            {categories.map((category) => {
                const IconComponent = iconMap[category.icon] || Disc;
                return (
                    <Link 
                        key={category.id} 
                        href={`/shop?category=${category.slug}`} 
                        className="category-card"
                    >
                        {category.image && (
                            <img 
                                src={category.image} 
                                alt={category.name} 
                                className="category-card-bg"
                                loading="lazy"
                            />
                        )}
                        <div className="category-card-overlay" />
                        <div className="category-card-content">
                            <div className="category-card-info">
                                <div className="category-card-icon">
                                    <IconComponent size={24} />
                                </div>
                                <span className="category-card-title">{category.name}</span>
                            </div>
                            <div className="category-card-arrow">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
