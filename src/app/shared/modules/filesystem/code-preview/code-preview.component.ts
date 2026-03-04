import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from 'app/core/learning-object-module/file/file.service';

@Component({
  selector: 'clark-code-preview',
  templateUrl: './code-preview.component.html',
  styleUrls: ['./code-preview.component.scss'],
})
export class CodePreviewComponent implements OnInit {
  fileName = '';
  language = '';
  fileContent = '';
  markdownContent = '';
  isLoading = true;
  hasError = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const url = params['url'];
      this.language = params['language'] || 'text';
      this.fileName = params['filename'] || 'Unknown File';

      if (url) {
        this.loadFileContent(decodeURIComponent(url));
      } else {
        this.handleError('No file URL provided');
      }
    });
  }

  /**
   * Loads file content from the provided URL
   */
  private loadFileContent(url: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.fileService
      .getLearningObjectFileContent(url)
      .then((content: string) => {
        this.fileContent = content;
        this.markdownContent = this.buildMarkdownContent(content, this.language);
        this.isLoading = false;
      })
      .catch((error) => {
        this.handleError(this.formatError(error));
      });
  }

  /**
   * Builds markdown content with code block and language syntax
   */
  private buildMarkdownContent(content: string, language: string): string {
    return `\`\`\`${language}\n${content}\n\`\`\``;
  }

  /**
   * Handles general errors
   */
  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.isLoading = false;
  }

  private formatError(error: unknown): string {
    if (error && typeof error === 'object') {
      const httpError = error as { status?: number; statusText?: string; message?: string };
      if (typeof httpError.status === 'number' && httpError.status > 0) {
        const statusText = httpError.statusText ? ` ${httpError.statusText}` : '';
        return `Could not load file (${httpError.status}${statusText}).`;
      }
    }

    if (typeof error === 'string' && error) {
      return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: string }).message;
      if (message) {
        return message;
      }
    }

    return 'Could not load file.';
  }

  /**
   * Copies code content to clipboard
   */
  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.fileContent);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }
}
