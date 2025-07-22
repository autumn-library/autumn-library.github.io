import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface MarkdownFile {
  filename: string;
  content: string;
  frontmatter: any;
  order: number;
}

function extractOrderFromFilename(filename: string): number {
  const match = filename.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : 999;
}

function processMarkdownFiles(directory: string): MarkdownFile[] {
  const files: MarkdownFile[] = [];
  
  if (!fs.existsSync(directory)) {
    return files;
  }
  
  const dirFiles = fs.readdirSync(directory);
  
  for (const filename of dirFiles) {
    if (filename.endsWith('.md')) {
      const filePath = path.join(directory, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      files.push({
        filename,
        content: markdownContent,
        frontmatter,
        order: extractOrderFromFilename(filename)
      });
    }
  }
  
  return files.sort((a, b) => a.order - b.order);
}

function createSinglePageDocumentation(): void {
  const basePath = 'docs/products/000-autumn';
  
  // Process getting-started files
  const gettingStartedFiles = processMarkdownFiles(path.join(basePath, 'getting-started'));
  
  // Process framework-elements files
  const frameworkElementsFiles = processMarkdownFiles(path.join(basePath, 'framework-elements'));
  
  let singlePageContent = `---
title: Autumn Framework - Полная документация
---

# Autumn Framework - Полная документация

Это единая страница с полной документацией по использованию фреймворка Autumn.

`;

  // Add getting-started section
  if (gettingStartedFiles.length > 0) {
    singlePageContent += `## Начало работы\n\n`;
    
    for (const file of gettingStartedFiles) {
      // Add title as heading
      if (file.frontmatter.title) {
        singlePageContent += `### ${file.frontmatter.title}\n\n`;
      }
      
      // Add content, adjusting heading levels
      let adjustedContent = file.content;
      // Convert all # to ### (since we're already at ## level)
      adjustedContent = adjustedContent.replace(/^# /gm, '#### ');
      adjustedContent = adjustedContent.replace(/^## /gm, '##### ');
      adjustedContent = adjustedContent.replace(/^### /gm, '###### ');
      
      singlePageContent += adjustedContent + '\n\n---\n\n';
    }
  }
  
  // Add framework-elements section
  if (frameworkElementsFiles.length > 0) {
    singlePageContent += `## Использование фреймворка\n\n`;
    
    for (const file of frameworkElementsFiles) {
      // Skip changelog and end files
      if (file.filename.includes('changelog') || file.filename.includes('end')) {
        continue;
      }
      
      // Add title as heading
      if (file.frontmatter.title) {
        singlePageContent += `### ${file.frontmatter.title}\n\n`;
      }
      
      // Add content, adjusting heading levels
      let adjustedContent = file.content;
      // Convert all # to #### (since we're already at ### level)
      adjustedContent = adjustedContent.replace(/^# /gm, '#### ');
      adjustedContent = adjustedContent.replace(/^## /gm, '##### ');
      adjustedContent = adjustedContent.replace(/^### /gm, '###### ');
      
      singlePageContent += adjustedContent + '\n\n---\n\n';
    }
  }
  
  // Clean up image paths to work from the single page location
  singlePageContent = singlePageContent.replace(/\.\.\/\.\.\/\.\.\//g, './');
  
  // Add a table of contents after the introduction
  let tocSection = `
## Содержание

### Начало работы
`;
  
  for (const file of gettingStartedFiles) {
    if (file.frontmatter.title) {
      const anchor = file.frontmatter.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[а-я]/g, (match) => {
          const cyrillicMap = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
            'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return cyrillicMap[match] || match;
        });
      tocSection += `- [${file.frontmatter.title}](#${anchor})\n`;
    }
  }
  
  tocSection += `
### Использование фреймворка
`;
  
  for (const file of frameworkElementsFiles) {
    if (file.filename.includes('changelog') || file.filename.includes('end')) {
      continue;
    }
    if (file.frontmatter.title) {
      const anchor = file.frontmatter.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[а-я]/g, (match) => {
          const cyrillicMap = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
            'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return cyrillicMap[match] || match;
        });
      tocSection += `- [${file.frontmatter.title}](#${anchor})\n`;
    }
  }
  
  // Insert the table of contents after the introduction
  const introEnd = singlePageContent.indexOf('\n## Начало работы\n\n');
  if (introEnd !== -1) {
    singlePageContent = singlePageContent.slice(0, introEnd) + 
                      tocSection + 
                      singlePageContent.slice(introEnd);
  }
  
  // Write the single page documentation
  const outputPath = 'docs/single-page.md';
  fs.writeFileSync(outputPath, singlePageContent, 'utf-8');
  
  console.log(`Single page documentation created at: ${outputPath}`);
  console.log(`Processed ${gettingStartedFiles.length} getting-started files`);
  console.log(`Processed ${frameworkElementsFiles.filter(f => !f.filename.includes('changelog') && !f.filename.includes('end')).length} framework-elements files`);
}

if (require.main === module) {
  createSinglePageDocumentation();
}

export { createSinglePageDocumentation };