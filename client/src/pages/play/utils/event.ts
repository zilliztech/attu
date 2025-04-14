import { type PlaygroundCustomEventDetail, CustomEventNameEnum } from '../Types';

type EventMap = {
  [CustomEventNameEnum.PlaygroundResponseDetail]: PlaygroundCustomEventDetail;
  [CustomEventNameEnum.PlaygroundCollectionUpdate]: { collectionName: string };
};

export class DocumentEventManager {
  static dispatch<K extends keyof EventMap>(eventName: K, detail: EventMap[K]) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  static subscribe<K extends keyof EventMap>(
    eventName: K,
    callback: (event: CustomEvent<EventMap[K]>) => void
  ) {
    document.addEventListener(eventName, callback as EventListener);
    return () => {
      document.removeEventListener(eventName, callback as EventListener);
    };
  }

  static unsubscribe<K extends keyof EventMap>(
    eventName: string,
    callback: (event: CustomEvent<EventMap[K]>) => void
  ) {
    document.removeEventListener(eventName, callback as EventListener);
  }
}
