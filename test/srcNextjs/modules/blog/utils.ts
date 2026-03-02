// src/modules/blog/utils.ts
import { Category } from "@/types/blog";

export const buildCategoryTree = (categories: Category[]): Category[] => {
  const map: Record<string, number> = {};
  const roots: Category[] = [];
  
  // Deep copy để tránh mutate data gốc
  const nodes = categories.map(c => ({ ...c, children: [] as Category[] }));

  // Tạo map để lookup nhanh
  nodes.forEach((node, i) => {
    map[node.id] = i;
  });

  // Xếp node vào cha hoặc root
  nodes.forEach((node) => {
    if (node.parentId && nodes[map[node.parentId]]) {
      nodes[map[node.parentId]].children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};