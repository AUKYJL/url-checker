import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, IsUrl } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    description: 'urls',
    example: ['https://example.com', 'https://openai.com'],
    type: 'array',
    minItems: 1,
    items: {
      type: 'string',
      format: 'uri',
      example: 'https://example.com',
    },
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    { each: true },
  )
  urls!: string[];
}
