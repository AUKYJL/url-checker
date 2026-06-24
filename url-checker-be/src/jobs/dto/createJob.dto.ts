import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, IsUrl } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    description: 'Список URL-адресов для проверки',
    example: ['https://example.com', 'https://openai.com'],
    type: 'array',
    minItems: 1,
    items: {
      type: 'string',
      format: 'uri',
      example: 'https://example.com',
    },
  })
  @IsArray({ message: 'Поле urls должно быть массивом URL-адресов' })
  @ArrayNotEmpty({ message: 'Список urls не должен быть пустым' })
  @IsString({
    each: true,
    message: 'Каждое значение в urls должно быть строкой',
  })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      each: true,
      message:
        'Каждое значение в urls должно быть корректным URL-адресом с http или https',
    },
  )
  urls!: string[];
}
