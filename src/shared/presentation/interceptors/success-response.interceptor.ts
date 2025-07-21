import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SuccessResponse, SuccessResponsePayload } from "@/shared/presentation/contracts/responses/success.response";

@Injectable()
export class SuccessResponseInterceptor<T> implements NestInterceptor<SuccessResponsePayload<T>, SuccessResponse<T>> {
    intercept(
        _: ExecutionContext,
        next: CallHandler<SuccessResponsePayload<T>>
    ): Observable<SuccessResponse<T>> {
        return next.handle()
            .pipe(
                map(returnedPayload => ({
                    success: true,
                    message: returnedPayload.message,
                    data: returnedPayload.data
                })
                ))
    }
}