import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { map, Observable } from 'rxjs';
import { ItemUpdatedEvent } from '../models/item-updated.event';
import { PublishItemCommand } from '../models/publish-item.command';

@Injectable()
export class SagaService {
  @Saga()
  itemUpdated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ItemUpdatedEvent),
      map(
        ({ id, item, collection }) =>
          new PublishItemCommand(collection, id, item),
      ),
    );
  };
}
