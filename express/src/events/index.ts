export class PubSub {
  handlers: { [index: string]: HandlerFunction[] };

  constructor() {
    this.handlers = {};
  }

  // sub
  on(eventType: string, handler: HandlerFunction) {
    if (!(eventType in this.handlers)) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
    return this;
  }

  // emit
  emit(eventType: string, ...handlerArgs: any[]) {
    // get args of handler that event trigger
    // const handlerArgs = Array.prototype.slice.call(arguments, 1);
    if (!(eventType in this.handlers)) {
      console.warn(`eventType: ${eventType} missing`);
      return;
    }
    this.handlers[eventType].forEach((handler) => {
      handler(...handlerArgs);
    });
    return this;
  }

  // delete
  off(eventType: string, handler: HandlerFunction) {
    if (!(eventType in this.handlers)) {
      console.warn(`eventType: ${eventType} missing`);
      return;
    }
    // delete handler
    this.handlers[eventType] = this.handlers[eventType].filter(
      (item) => item !== handler
    );
    return this;
  }
}

type HandlerFunction = (...args: any) => void;

export const pubSub = new PubSub();
