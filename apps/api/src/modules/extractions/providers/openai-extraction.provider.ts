import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractionInput, ExtractionResult } from '@applyalert/contracts';
import { ExtractionResultSchema } from '@applyalert/validation';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ExtractionProvider, ExtractionContext, RawAiResult } from './extraction-provider.interface';
import { OPPORTUNITY_EXTRACTION_PROMPT_V1 } from '../prompts/opportunity-extraction.v1';

@Injectable()
export class OpenAiExtractionProvider implements ExtractionProvider {
  private readonly logger = new Logger(OpenAiExtractionProvider.name);
  private readonly openai: OpenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.modelName = this.configService.get<string>('OPENAI_EXTRACTION_MODEL') || 'gpt-4o-2024-08-06';
    
    // Fallback for tests or local dev if key isn't provided right away
    this.openai = new OpenAI({ 
      apiKey: apiKey || 'dummy-key',
    });
  }

  async extract(input: ExtractionInput, context: ExtractionContext): Promise<RawAiResult> {
    this.logger.debug(`Starting OpenAI extraction for import: ${input.importId}, context: ${context.extractionId}`);

    const userContent = this.buildUserPrompt(input);

    // @ts-expect-error - OpenAI beta types might be missing in this exact version
    const completion = await this.openai.beta.chat.completions.parse({
      model: this.modelName,
      messages: [
        { role: 'system', content: OPPORTUNITY_EXTRACTION_PROMPT_V1 },
        { role: 'user', content: userContent },
      ],
      response_format: zodResponseFormat(ExtractionResultSchema, 'extraction_result'),
      temperature: 0.1, // Low temperature for factual extraction
    });

    const parsedResult = completion.choices[0]?.message?.parsed;

    if (!parsedResult) {
      throw new Error('OpenAI returned an empty or invalid structured output.');
    }

    return {
      result: parsedResult as ExtractionResult,
      provider: 'openai',
      model: this.modelName,
    };
  }

  private buildUserPrompt(input: ExtractionInput): string {
    let content = 'Please extract information from the following source material:\n\n';

    if (input.sourceUrl) {
      content += `URL: ${input.sourceUrl}\n`;
    }
    if (input.title) {
      content += `Title: ${input.title}\n`;
    }

    content += '\n--- SOURCE TEXT START ---\n';
    
    if (input.sections && input.sections.length > 0) {
      for (const section of input.sections) {
        if (section.heading) {
          content += `\n[${section.heading}]\n`;
        }
        content += `${section.text}\n`;
      }
    } else if (input.text) {
      content += `${input.text}\n`;
    }
    
    content += '\n--- SOURCE TEXT END ---\n';

    return content;
  }
}
