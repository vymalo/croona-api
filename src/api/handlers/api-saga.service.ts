import { Injectable, Logger } from "@nestjs/common";
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { map, Observable, tap } from "rxjs";
import { ItemUpdatedEvent } from '../models/item-updated.event';
import { PublishItemCommand } from '../models/publish-item.command';

@Injectable()
export class ApiSagaService {
  @Saga()
  itemUpdated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ItemUpdatedEvent),
      tap((event) => {
        Logger.log('Item updated', 'ApiSagaService');
        Logger.debug('Value is', event, 'ApiSagaService');
      }),
      map(
        ({ id, item, collection }) =>
          new PublishItemCommand(collection, id, item),
      ),
    );
  };
}
