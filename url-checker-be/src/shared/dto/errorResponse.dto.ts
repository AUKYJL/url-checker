import { ApiProperty } from '@nestjs/swagger';

export class NotFoundErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({
    example: 'Job 123e4567-e89b-12d3-a456-426614174000 not found',
  })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: [
      'urls should not be empty',
      'each value in urls must be a URL address',
    ],
    type: [String],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
