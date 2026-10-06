import { NotebookItem } from "@/types/loreno";

export interface CourseDoc {
  id: string;
  url: string;
  name?: string;
  isPdf?: boolean;
  isNew?: boolean;
  base64?: string;
  mimeType?: string;
}

export interface MirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  deckTitle?: string;
  currentNotebook?: NotebookItem;
  onDeckUpdated?: () => void;
}
