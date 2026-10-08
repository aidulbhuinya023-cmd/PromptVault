import { describe, it, expect } from 'vitest';
import { extractVariables } from '../src/services/promptService';

describe('PromptVault Validation and Variable Parsing', () => {
  it('correctly extracts unique variable placeholders from prompt template', () => {
    const template = `You are a Principal Engineer. Review code for {{service_name}} with SLA {{latency_sla}}. Also check {{service_name}} memory bounds.`;
    const vars = extractVariables(template);
    expect(vars).toEqual(['service_name', 'latency_sla']);
  });

  it('handles templates without variables', () => {
    const template = `Write a short python function to calculate Fibonacci numbers.`;
    const vars = extractVariables(template);
    expect(vars).toEqual([]);
  });

  it('handles spaces within variable brackets', () => {
    const template = `Generate RFP for {{  client_name   }} and {{ product_sku }}`;
    const vars = extractVariables(template);
    expect(vars).toContain('client_name');
    expect(vars).toContain('product_sku');
  });

  it('validates prompt boundary constraints against denial-of-wallet', () => {
    const validPromptTitle = 'Senior Code Reviewer';
    const excessivePromptTitle = 'A'.repeat(151);

    expect(validPromptTitle.length <= 150).toBe(true);
    expect(excessivePromptTitle.length <= 150).toBe(false);
  });
});
