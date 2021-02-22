import React, { HTMLAttributes } from 'react';
declare type Props = HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    /** Called when the user finishes a sorting gesture. */
    onSortEnd: (oldIndex: number, newIndex: number) => void;
    /** Class applied to the item being dragged */
    draggedItemClassName?: string;
};
declare const SortableList: ({ children, onSortEnd, draggedItemClassName, ...rest }: Props) => JSX.Element;
export default SortableList;
declare type ItemProps = {
    children: React.ReactElement;
    index: number;
};
/**
 * SortableItem only adds a ref to its children so that we can register it to the main Sortable
 */
export declare const SortableItem: ({ children, index }: ItemProps) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
//# sourceMappingURL=index.d.ts.map