import React from "react";
import { motion, AnimatePresence } from "motion/react";

const childrenMotion = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const chevronMotion = {
  collapsed: { rotate: 0 },
  expanded: {
    rotate: 90,
    transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function CategoryNode({
  category,
  isSelected,
  isExpanded,
  onToggle,
  onSelect,
  children = [],
  level = 0,
}) {
  const hasChildren = children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`group flex items-center gap-1.5 rounded-lg transition-colors duration-150 ${
          isSelected ? "bg-amber-50" : "hover:bg-zinc-50"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(category.id);
            }}
            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
            className="flex-shrink-0 p-1 rounded text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
              variants={chevronMotion}
              animate={isExpanded ? "expanded" : "collapsed"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </motion.svg>
          </button>
        ) : (
          <span className="w-[22px] flex-shrink-0" aria-hidden="true" />
        )}

        {/* Category name button */}
        <button
          type="button"
          onClick={() => onSelect(category)}
          aria-current={isSelected ? "page" : undefined}
          className={`flex-1 text-left py-2 pr-3 text-sm font-medium rounded-r-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400 transition-colors duration-150 ${
            isSelected
              ? "text-zinc-900"
              : "text-zinc-600 group-hover:text-zinc-900"
          }`}
        >
          <span className="line-clamp-1">{category.name}</span>
        </button>

        {/* Selected indicator dot */}
        {isSelected && (
          <span className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            variants={childrenMotion}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            {children.map((child) => (
              <CategoryNode
                key={child.category.id}
                category={child.category}
                isSelected={child.isSelected}
                isExpanded={child.isExpanded}
                onToggle={onToggle}
                onSelect={onSelect}
                children={child.children}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
