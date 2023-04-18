export type ID = string;

export default abstract class Entity {
  id?: ID;

  constructor({
    id
  }: {
    id?: ID
  }) {
    this.id = id;
  }
}
