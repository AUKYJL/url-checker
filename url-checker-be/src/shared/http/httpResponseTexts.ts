import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const HTTP_ERROR_TEXT = {
  badRequest: 'Некорректный запрос',
  notFound: 'Не найдено',
} as const;

export const createValidationException = (
  validationErrors: ValidationError[],
): BadRequestException => {
  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: validationErrors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : [],
    ),
    error: HTTP_ERROR_TEXT.badRequest,
  });
};

export const createJobNotFoundException = (id: string): NotFoundException => {
  return new NotFoundException({
    statusCode: HttpStatus.NOT_FOUND,
    message: `Задача ${id} не найдена`,
    error: HTTP_ERROR_TEXT.notFound,
  });
};
