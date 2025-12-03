export interface Identifiable {
    [key: string]: any;
    id: string | number;
}

export interface ListItem {
    id: number;
    name?: string;
}

export type ItemOrId = number | ListItem;

//TODO: It would be nice to update object references can have a number
// for an ID to this interface instead.
export interface IdentifiableListItem extends Identifiable {
    name?: string;
}

export interface ListItemWithRelated extends ListItem {
    related?: ListItem[];
}

// This is the value structure of this Control when `withRelatedItems` is true
export interface RelationalItems {
    items: number[];
    relatedItems: number[];
    includeRelated: boolean;
}
export type SelectedItem = ListItem | string | null;

export const isListItem = (item?: SelectedItem | number): item is ListItem => {
    return (
        typeof item !== 'string' &&
        typeof item !== 'number' &&
        item?.id !== undefined
    );
};

export const resolveToNumberOrId = (
    v: Identifiable | number | string | null
): number | null => {
    // Check for null input first
    if (v === null) {
        return null;
    }

    // Handle case where v is an object with an id property
    if (typeof v === 'object' && 'id' in v) {
        v = v.id; // Extract the id to be processed below
    }

    // If v is a string, try to parse it to a number
    if (typeof v === 'string') {
        // Check if the string is empty or contains only whitespace
        if (v.trim() === '') {
            return -1;
        }

        const parsed = Number(v);
        // Check if the string is a valid number
        return isNaN(parsed) ? -1 : parsed;
    }

    // If v is a number, return it directly
    if (typeof v === 'number') {
        return v;
    }

    // Fallback case, should not reach here based on current input types
    return -1;
};


export const resolveToNumberOrString = (
  v: Identifiable | number | string | null
): string | number | null => {
  // Check for null input first
  if (v === null) {
      return null;
  }

  // Handle case where v is an object with an id property
  if (typeof v === 'object' && 'id' in v) {
      v = v.id; // Extract the id to be processed below
  }

  // If v is a string, try to parse it to a number
  if (typeof v === 'string') {
      // Check if the string is empty or contains only whitespace
      if (v.trim() === '') {
          return '';
      }

      const parsed = Number(v);
      // Check if the string is a valid number
      return isNaN(parsed) ? v : parsed;
  }

  // If v is a number, return it directly
  if (typeof v === 'number') {
      return v;
  }

  // Fallback case, should not reach here based on current input types
  return -1;
};