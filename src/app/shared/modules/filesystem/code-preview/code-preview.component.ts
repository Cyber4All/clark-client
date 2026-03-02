import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
    private http: HttpClient,
  ) { }

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

    this.http
      .get(url, {
        withCredentials: true,
        responseType: 'text',
      })
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleHttpError(error)),
      )
      .subscribe(
        (content: string) => {
          this.fileContent = content;
          this.markdownContent = this.buildMarkdownContent(
            content,
            this.language,
          );
          this.isLoading = false;
        },
        (error) => {
          this.handleError(error);
        },
      );
  }

  /**
   * Builds markdown content with code block and language syntax
   */
  private buildMarkdownContent(content: string, language: string): string {
    return `\`\`\`${language}\n${content}\n\`\`\``;
  }

  /**
   * Handles HTTP errors
   */
  private handleHttpError(error: HttpErrorResponse) {
    let errorMsg = 'Failed to load file';

    if (error.error instanceof ErrorEvent) {
      errorMsg = `Error: ${error.error.message}`;
    } else {
      errorMsg = `Error ${error.status}: ${error.message}`;
    }

    return throwError(errorMsg);
  }

  /**
   * Handles general errors
   */
  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.isLoading = false;
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
