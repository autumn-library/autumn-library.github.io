import fs from 'fs';
import path from 'path';
import { createSinglePageDocumentation, createSinglePageToggleDocumentation } from './generate-single-page.ts';

function hasMarkdownContent(directory: string): boolean {
  if (!fs.existsSync(directory)) return false;
  
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  // Check for markdown files in current directory
  const markdownFiles = items.filter(item => 
    item.isFile() && item.name.endsWith('.md')
  );
  
  // Has content if there are any markdown files
  if (markdownFiles.length > 0) return true;
  
  // Check subdirectories recursively
  const hasSubdirContent = items.some(item => {
    if (item.isDirectory() && !item.name.startsWith('.')) {
      return hasMarkdownContent(path.join(directory, item.name));
    }
    return false;
  });
  
  return hasSubdirContent;
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

function generateMissingSinglePages(): void {
  console.log('Checking for missing single-page documentation...');
  
  const sections: ('products' | 'api')[] = ['products', 'api'];
  
  for (const sectionType of sections) {
    const sectionPath = `docs/${sectionType}`;
    
    if (!fs.existsSync(sectionPath)) continue;
    
    const products = fs.readdirSync(sectionPath)
      .filter(item => {
        const itemPath = path.join(sectionPath, item);
        return fs.lstatSync(itemPath).isDirectory() || fs.lstatSync(itemPath).isSymbolicLink();
      });
    
    for (const productName of products) {
      const productPath = path.join(sectionPath, productName);
      
      // Determine output paths for both original and toggle modes
      let outputPath: string;
      let toggleOutputPath: string;
      
      if (sectionType === 'api') {
        // API files go in the original structure
        outputPath = `${productPath}/single-page.md`;
        // Toggle mode files
        const displayName = getProductDisplayName(productName).toLowerCase().replace(/\s+/g, '-');
        toggleOutputPath = `docs/single-page/api/${displayName}.md`;
      } else {
        // Product files go in the clean name structure (bypass products/ rewrites)
        const displayName = getProductDisplayName(productName).toLowerCase().replace(/\s+/g, '-');
        outputPath = `docs/${displayName}/single-page.md`;
        // Toggle mode files
        toggleOutputPath = `docs/single-page/${displayName}.md`;
      }
      
      // Generate original single-page if missing
      if (!fs.existsSync(outputPath) && hasMarkdownContent(productPath)) {
        try {
          createSinglePageDocumentation(sectionType, productName);
          console.log(`Generated missing single-page: ${outputPath}`);
        } catch (error) {
          console.warn(`Failed to generate single-page for ${sectionType}/${productName}: ${error.message}`);
        }
      }
      
      // Generate toggle mode single-page if missing
      if (!fs.existsSync(toggleOutputPath) && hasMarkdownContent(productPath)) {
        try {
          createSinglePageToggleDocumentation(sectionType, productName);
          console.log(`Generated missing toggle single-page: ${toggleOutputPath}`);
        } catch (error) {
          console.warn(`Failed to generate toggle single-page for ${sectionType}/${productName}: ${error.message}`);
        }
      }
    }
  }
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMissingSinglePages();
}

export { generateMissingSinglePages };