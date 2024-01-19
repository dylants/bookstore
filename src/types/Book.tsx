export interface Book {
  ISBN: string;
  author: string;
  genre: string;
  imageUrl?: string;
  publishedDate: Date;
  publisher: string;
  title: string;
  // TODO add subtitle and description
  // TODO add binding, price, cost, and quantity
}
