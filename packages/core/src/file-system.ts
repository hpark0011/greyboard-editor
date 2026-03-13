export interface FileNode {
  type: "file";
  name: string;
  path: string;
  extension: string;
}

export interface FolderNode {
  type: "folder";
  name: string;
  path: string;
  children: TreeNode[];
  expanded: boolean;
}

export type TreeNode = FileNode | FolderNode;
