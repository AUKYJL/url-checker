import { ApiProperty } from '@nestjs/swagger';

export class NotFoundErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({
    example: 'Задача 123e4567-e89b-12d3-a456-426614174000 не найдена',
  })
  message: string;

  @ApiProperty({ example: 'Не найдено' })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: [
      'Список urls не должен быть пустым',
      'Каждое значение в urls должно быть корректным URL-адресом с http или https',
    ],
    type: [String],
  })
  message: string[];

  @ApiProperty({ example: 'Некорректный запрос' })
  error: string;
}
