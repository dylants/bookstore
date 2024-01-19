export interface Book {
  author: string;
  genre: string;
  imageUrl?: string | null;
  isbn: string;
  publishedDate: Date;
  publisher: string;
  title: string;
  // TODO add subtitle and description
  // TODO add binding, price, cost, and quantity
}
