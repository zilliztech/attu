export class SimpleQueue<T> {
  private arr: T[] = []; // Array to store data and maintain insertion order
  public isObseleted: boolean = false; // Flag to indicate if execution is in progress

  // Method to add an item to the queue
  enqueue(item: T) {
    this.arr.push(item);
  }

  // Method to remove and return the earliest inserted item from the queue
  dequeue(): T | undefined {
    return this.arr.shift();
  }

  // Method to get the latest inserted item in the queue
  getLatest(): T | undefined {
    return this.arr[this.arr.length - 1];
  }

  // Method to get the earliest inserted item in the queue
  getEarliest(): T | undefined {
    return this.arr[0];
  }

  // Method to get the size of the queue
  size(): number {
    return this.arr.length;
  }

  // Method to check if the queue is empty
  isEmpty(): boolean {
    return this.arr.length === 0;
  }

  // Method to clear the queue
  stop() {
    this.arr = [];
    this.isObseleted = true; // Reset the execution flag
  }

  // Method to execute each item in the queue sequentially until the queue is empty
  async executeNext(
    callback: (items: T[], q: SimpleQueue<T>) => Promise<void>,
    count: number = 1
  ) {
    if (this.isObseleted) {
      return; // If execution is already in progress, return
    }

    // items to process
    const items: T[] = [];
    while (!this.isEmpty() && items.length < count) {
      const item = this.dequeue();
      if (item !== undefined) {
        items.push(item);
      }
    }
    // execute callback
    if (items.length > 0) {
      await callback(items, this);
    }
  }
}
