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
  const markdownFiles = dirFiles.filter(f => f.endsWith('.md'));
  
  for (const filename of dirFiles) {
    if (filename.endsWith('.md')) {
      // Skip index.md only if there are other markdown files
      if (filename === 'index.md' && markdownFiles.length > 1) {
        continue;
      }
      
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

function processAllFilesRecursively(directory: string, baseDir: string = ''): MarkdownFile[] {
  const allFiles: MarkdownFile[] = [];
  
  if (!fs.existsSync(directory)) {
    return allFiles;
  }
  
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  // First, process files in current directory
  const files = processMarkdownFiles(directory);
  allFiles.push(...files);
  
  // Then, process subdirectories recursively with proper ordering
  const directories = items
    .filter(item => item.isDirectory())
    .map(item => item.name)
    .sort();
  
  // Special ordering for common documentation structure
  const orderedDirectories = sortDirectoriesForDocumentation(directories);
    
  for (const subDir of orderedDirectories) {
    // Skip certain directories
    if (subDir === 'index' || subDir.startsWith('.')) continue;
    
    const subDirPath = path.join(directory, subDir);
    const subFiles = processAllFilesRecursively(subDirPath, path.join(baseDir, subDir));
    allFiles.push(...subFiles);
  }
  
  return allFiles;
}

function sortDirectoriesForDocumentation(directories: string[]): string[] {
  // Define the preferred order for common documentation directories
  const preferredOrder = [
    'getting-started',
    'framework-elements',
    'api',
    'examples',
    'guides',
    'reference'
  ];
  
  // Sort directories by preferred order, then alphabetically for others
  return directories.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);
    
    // If both are in preferred order, sort by that order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in preferred order, prefer it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // Otherwise, sort alphabetically
    return a.localeCompare(b);
  });
}

function adjustImagePaths(content: string, productName: string, sectionType: 'products' | 'api'): string {
  // Adjust relative image paths for single-page context
  return content.replace(/!\[([^\]]*)\]\((?!http)([^)]+)\)/g, (match, alt, imagePath) => {
    if (imagePath.startsWith('/')) {
      return match; // Absolute paths are fine
    }
    
    // Handle relative paths that go up directories (../)
    if (imagePath.includes('../')) {
      // For paths like "../../../static/autumn/cover.png"
      // Convert to absolute path from the root
      const segments = imagePath.split('/');
      let upCount = 0;
      let pathParts = [];
      
      for (const segment of segments) {
        if (segment === '..') {
          upCount++;
        } else if (segment !== '.') {
          pathParts.push(segment);
        }
      }
      
      // Create absolute path
      const adjustedPath = '/' + pathParts.join('/');
      return `![${alt}](${adjustedPath})`;
    }
    
    // For simple relative paths, make them relative to the product
    const adjustedPath = `/${sectionType}/${productName}/${imagePath}`;
    return `![${alt}](${adjustedPath})`;
  });
}

function adjustHeadingLevels(content: string, level: number): string {
  // Adjust heading levels by adding the specified number of # characters
  return content.replace(/^(#{1,6})\s/gm, (match, hashes) => {
    const newLevel = Math.min(hashes.length + level, 6);
    return '#'.repeat(newLevel) + ' ';
  });
}

function generateTableOfContents(files: MarkdownFile[]): string {
  let toc = '## Содержание\n\n';
  
  for (const file of files) {
    const title = file.frontmatter.title || file.filename.replace(/^\d+-/, '').replace('.md', '');
    const anchor = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    toc += `- [${title}](#${anchor})\n`;
  }
  
  return toc + '\n';
}

function createSinglePageDocumentation(sectionType: 'products' | 'api', productName: string): void {
  const basePath = `docs/${sectionType}/${productName}`;
  
  if (!fs.existsSync(basePath)) {
    console.error(`Error: Directory ${basePath} does not exist`);
    return;
  }
  
  // Get all markdown files recursively
  const allFiles = processAllFilesRecursively(basePath);
  
  if (allFiles.length === 0) {
    console.log(`No markdown files found in ${basePath}`);
    return;
  }
  
  // Create frontmatter for single page
  const frontmatter = {
    title: `${getProductDisplayName(productName)} - Полная документация`,
    description: `Это единая страница с полной документацией по ${getProductDisplayName(productName)}.`
  };
  
  let singlePageContent = '---\n';
  singlePageContent += `title: "${frontmatter.title}"\n`;
  singlePageContent += `description: "${frontmatter.description}"\n`;
  singlePageContent += '---\n\n';
  
  singlePageContent += `# ${frontmatter.title}\n\n`;
  singlePageContent += `${frontmatter.description}\n\n`;
  
  // Process and combine all files without TOC or extra section titles
  for (const file of allFiles) {
    // Adjust content
    let processedContent = adjustImagePaths(file.content, productName, sectionType);
    processedContent = adjustHeadingLevels(processedContent, 0); // Don't adjust heading levels
    
    // Add the content directly without extra section titles
    singlePageContent += processedContent;
    singlePageContent += '\n\n---\n\n';
  }
  
  // Remove the last separator
  singlePageContent = singlePageContent.replace(/\n\n---\n\n$/, '\n');
  
  // Generate output filename using correct file structure
  // Files need to be placed in the source structure to work with VitePress rewrites
  let outputPath: string;
  
  if (sectionType === 'api') {
    // For API: place in docs/api/000-product/single-page.md 
    // This will be accessible at /api/product/single-page after rewrites
    outputPath = `${basePath}/single-page.md`;
  } else {
    // For products: place in docs/product-name/single-page.md (bypass products/ rewrites)
    // This will be accessible at /product-name/single-page
    const displayName = getProductDisplayName(productName).toLowerCase().replace(/\s+/g, '-');
    const productDir = `docs/${displayName}`;
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }
    outputPath = `${productDir}/single-page.md`;
  }
  
  // Write the single page file
  fs.writeFileSync(outputPath, singlePageContent, 'utf-8');
  
  console.log(`Single-page documentation generated: ${outputPath}`);
  console.log(`Total files combined: ${allFiles.length}`);
  console.log(`Total content size: ${Math.round(singlePageContent.length / 1024)}KB`);
}

function getProductDisplayName(productName: string): string {
  // Remove number prefix and capitalize
  const cleanName = productName.replace(/^\d+-/, '');
  
  // Special cases for display names
  const displayNames: { [key: string]: string } = {
    'autumn': 'autumn',
    'winow': 'winow',
    'annotations': 'annotations',
    'extends': 'extends', 
    'autumn-cli': 'autumn-cli',
    'autumn-collections': 'autumn-collections',
    'autumn-logos': 'autumn-logos'
  };
  
  return displayNames[cleanName] || cleanName;
}

function getAvailableProducts(sectionType: 'products' | 'api'): string[] {
  const sectionPath = `docs/${sectionType}`;
  
  if (!fs.existsSync(sectionPath)) {
    return [];
  }
  
  return fs.readdirSync(sectionPath, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name)
    .sort();
}

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run generate-single-page [section-type] [product-name]');
    console.log('');
    console.log('Available sections:');
    console.log('  products - Product documentation');
    console.log('  api      - API documentation');
    console.log('');
    console.log('Available products:');
    
    const products = getAvailableProducts('products');
    const apis = getAvailableProducts('api');
    
    console.log('  Products:', products.join(', '));
    console.log('  APIs:', apis.join(', '));
    console.log('');
    console.log('Examples:');
    console.log('  npm run generate-single-page products 000-autumn');
    console.log('  npm run generate-single-page api 000-autumn');
    console.log('  npm run generate-single-page products 002-annotations');
    return;
  }
  
  if (args.length !== 2) {
    console.error('Error: Please provide both section type and product name');
    console.log('Usage: npm run generate-single-page [section-type] [product-name]');
    return;
  }
  
  const [sectionType, productName] = args;
  
  if (sectionType !== 'products' && sectionType !== 'api') {
    console.error('Error: Section type must be either "products" or "api"');
    return;
  }
  
  createSinglePageDocumentation(sectionType as 'products' | 'api', productName);
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createSinglePageDocumentation };