export default interface PaginationQuery {
  after?: string | null;
  before?: string | null;
  first?: number | null;
  last?: number | null;
}
