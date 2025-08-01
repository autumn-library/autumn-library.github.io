import { DefaultTheme, defineConfig } from 'vitepress'
import { glob } from 'glob';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { createSinglePageDocumentation, generateAllToggleSinglePages } from '../generate-single-page.ts';

const contentRoot = 'docs/';

// https://vitepress.dev/reference/site-config
export default defineConfig({

  vite: {
    resolve: {
      preserveSymlinks: true
    }
  },

  buildStart(siteConfig) {
    // Generate single-page documentation for all products and APIs during dev if missing
    generateAllSinglePages();
    // Generate toggle mode single-page documentation
    generateAllToggleSinglePages();
  },

  buildEnd(siteConfig) {
    // Generate single-page documentation for all products and APIs
    generateAllSinglePages();
    // Generate toggle mode single-page documentation
    generateAllToggleSinglePages();
  },

  transformPageData(pageData, ctx) {
    const repositories = JSON.parse(fs.readFileSync('repositories.json', 'utf-8'));
    const repositoriesMap: Map<string, RepoData> = new Map(repositories.map((repoData: RepoData) => [repoData.repository, repoData]));

    let repoName: string = '';
    
    // Use filePath for all variants to extract repository name
    if (pageData.filePath) {
      if (pageData.filePath.startsWith('api/')) {
        // For API paths: api/000-autumn/... or api/003-extends/...
        const pathSegments = pageData.filePath.split('/');
        const repoSegment = pathSegments[1] || '';
        repoName = repoSegment.replace(/^\d+-/, ''); // Remove number prefix
      } else if (pageData.filePath.startsWith('products/')) {
        // For product paths: products/000-autumn/... or products/003-extends/...
        const pathSegments = pageData.filePath.split('/');
        const repoSegment = pathSegments[1] || '';
        repoName = repoSegment.replace(/^\d+-/, ''); // Remove number prefix
      }
    }
    
    const repoData = repositoriesMap.get(repoName);

    // Disable outline for single-page documentation
    if (pageData.relativePath && 
        (pageData.relativePath.endsWith('/single-page.md') || 
         pageData.relativePath.includes('single-page/'))) {
      pageData.frontmatter = pageData.frontmatter || {};
      pageData.frontmatter.outline = false;
    }

    return {
      params: {
        organization: repoData?.organization,
        repository: repoData?.repository,
      }
    }

  },

  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-ZHG1MYKGV9' }
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-ZHG1MYKGV9');"
    ],
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  appearance: 'dark',

  title: "Autumn Docs",
  description: "Это документация для Autumn - DI framework для OneScript",
  lang: 'ru-RU',

  srcDir: 'docs',

  // https://vitepress.dev/reference/site-config#base
  //base: "/docs",

  rewrites(id) {
    // Handle single-page mode routes first
    if (id.includes('single-page/api/')) {
      // Convert docs/single-page/api/autumn.md -> /single-page/api/autumn
      return id;
    }
    if (id.includes('single-page/')) {
      // Convert docs/single-page/autumn.md -> /single-page/autumn  
      return id;
    }
    
    return id
      .replace(/\d+-/g, '')                 // удаление префикса сортировки
      .replaceAll('\\', '/')               // замена обратных виндовых слешей на прямые
      .replaceAll('products/autumn/', '')  // подмена пути products/autumn на корень
      .replaceAll('products/', '');        // удаление префикса products
  },

  cleanUrls: true,

  lastUpdated: true,

  locales: {
    root: {
      label: 'Русский',
      lang: 'ru'
    },

  },

  ignoreDeadLinks: [
    'localhostLinks',
    (url: string, context?: string) => {
      // Ignore all dead links in single-page documentation and localhost links
      if (url && url.startsWith('http://localhost')) return true;
      return (context && context.includes('single-page')) || (url && url.includes('%D0%'));
    }
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    logo: 'acorn-ol.webp',

    nav: [
      { text: 'Главная', link: '/' },
      { 
        text: 'Документация',
        items: [
          { text: 'autumn', link: '/getting-started/about-autumn' },
          ...getNavBarItems('products/', false, 'autumn'),
        ]
       },
      { 
        text: 'API', 
        items: [
          ...getNavBarItems('api/'),
        ]
       },
      { 
        text: 'Одностраничный режим',
        items: [
          { text: 'Документация', items: getToggleModeNavItems().products },
          { text: 'API', items: getToggleModeNavItems().api },
        ]
       },
    ],

    sidebar: generateAllSidebarConfigurations(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/autumn-library/autumn' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 10 50 50"><path d="M36,12c13.255,0,24,10.745,24,24S49.255,60,36,60S12,49.255,12,36S22.745,12,36,12z M44.279,45.783	c0.441-1.354,2.51-14.853,2.765-17.513c0.077-0.806-0.177-1.341-0.676-1.58c-0.603-0.29-1.496-0.145-2.533,0.229	c-1.421,0.512-19.59,8.227-20.64,8.673c-0.995,0.423-1.937,0.884-1.937,1.552c0,0.47,0.279,0.734,1.047,1.008	c0.799,0.285,2.812,0.895,4.001,1.223c1.145,0.316,2.448,0.042,3.178-0.412c0.774-0.481,9.71-6.46,10.351-6.984	c0.641-0.524,1.152,0.147,0.628,0.672c-0.524,0.524-6.657,6.477-7.466,7.301c-0.982,1.001-0.285,2.038,0.374,2.453	c0.752,0.474,6.163,4.103,6.978,4.685c0.815,0.582,1.641,0.846,2.398,0.846S43.902,46.94,44.279,45.783z"></path></svg>'
        },
        link: 'https://t.me/autumn_winow'
      }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Поиск',
            buttonAriaLabel: 'Поиск'
          },
          modal: {
            displayDetails: 'Отображать детали',
            resetButtonTitle: 'Сбросить',
            backButtonTitle: 'Назад',
            noResultsText: 'Нет результатов',
            footer: {
              selectText: 'Выбрать',
              selectKeyAriaLabel: 'Выбрать',
              navigateText: 'Навигация',
              navigateUpKeyAriaLabel: 'Вверх',
              navigateDownKeyAriaLabel: 'Вниз',
              closeText: 'Закрыть',
              closeKeyAriaLabel: 'esc'
            }
          }
        }
      }
    },

    editLink: {
      text: 'Редактировать страницу',
      pattern: ( pageData ) => {

        const filePath = pageData.filePath
        const organization = pageData.params?.organization;
        const repository = pageData.params?.repository;

        // If we have repository info from params, use it directly
        if (organization && repository) {
          if (filePath.startsWith('api/')) {
            // For API paths, remove 'api/' and repository name from path
            const [_, repoSegment, ...rest] = filePath.split('/')
            const restPath = rest.join('/')
            return `https://github.com/${organization}/${repository}/edit/master/docs/api/${restPath}`;
          }

          // For product pages - extract path after repository segment
          if (filePath.startsWith('products/')) {
            const [_, repoSegment, ...rest] = filePath.split('/')
            const restPath = rest.join('/')
            return `https://github.com/${organization}/${repository}/edit/master/docs/product/${restPath}`;
          }
        }

        return ''
      }
    },

    docFooter: {
      prev: 'Предыдущая страница',
      next: 'Следующая страница'
    },

    outline: { label: 'Содержание страницы' },

    lastUpdated: {
      text: 'Обновлено'
    },

    darkModeSwitchLabel: 'Оформление',
    lightModeSwitchTitle: 'Переключить на светлую тему',
    darkModeSwitchTitle: 'Переключить на тёмную тему',
    sidebarMenuLabel: 'Меню',
    returnToTopLabel: 'Вернуться к началу',
    langMenuLabel: 'Изменить язык'

  }
})

type RepoData = {
  repository: string;
  organization: string;
};

interface SidebarOptions {
  contentRoot: string;
  contentDirs: { text: string; dir: string; }[];
  collapsed: boolean;
  baseLink: string;
}

function getSidebars(contentDir: string, appendSideBarWithContentDir: boolean = true, excluded: string = ''): DefaultTheme.SidebarMulti {

  const sidebars: DefaultTheme.SidebarMulti = {};

  const cwd = `${process.cwd()}/${contentRoot}`;

  const dirs = glob.sync(`${contentDir}/*/`, { cwd }).sort();
  for (const dirIndex in dirs) {
    const dir = dirs[dirIndex].replaceAll('\\', '/');
    const text = getPageName(path.basename(dir), false);
    const link = appendSideBarWithContentDir ? `/${contentDir}${text}/` : `/${text}/`;

    if (text === excluded) continue;

    sidebars[link] = getSidebar({
      contentRoot: contentRoot + dir + '/',
      contentDirs: [
        { text, dir: "." }
      ],
      collapsed: false,
      baseLink: link
    });
  }

  return sidebars;

}

function getSidebar({ contentRoot, contentDirs, collapsed, baseLink }: SidebarOptions): DefaultTheme.SidebarItem[] {
  const sidebar: DefaultTheme.SidebarItem[] = [];

  for (const contentDir of contentDirs) {
    const sidebarConfig = getSidebarConfig(contentRoot, contentDir.dir, contentDir.text, collapsed, baseLink);
    sidebar.push(sidebarConfig);
  }

  return sidebar;
}


function getSidebarConfig(contentRoot, contentDir, text, collapsed, baseLink): DefaultTheme.SidebarItem {
  const indexPath = path.posix.join(contentRoot, contentDir, `index.md`);
  const link = fs.existsSync(indexPath) ?  path.posix.join(baseLink, `index.md`) : ''

  const sidebarConfig: DefaultTheme.SidebarItem = {
    text,
    items: getSidebarItems(contentRoot, contentDir, baseLink),
    collapsed,
    link: link
  };

  return sidebarConfig;
}

function getSidebarItems(contentRoot, contentDir, baseLink): DefaultTheme.SidebarItem[] {
  const sidebarItems: DefaultTheme.SidebarItem[] = [];
  const cwd = `${process.cwd()}/${contentRoot}`;

  const dirs = glob.sync(`${contentDir}/*/`, { cwd }).sort();
  for (const dirIndex in dirs) {
    const dir = dirs[dirIndex];
    const indexPath = `${dir}/index.md`.replaceAll('\\', '/');
    const link = fs.existsSync(`${contentRoot}/${indexPath}`) ? `/${baseLink}/${indexPath}` : ''

    sidebarItems.push({
      text: getPageName(path.basename(dir)),
      items: getSidebarItems(contentRoot, dir.replaceAll('\\', '/'), baseLink),
      collapsed: false,
      link: link
    });
  }

  const files = glob.sync(`${contentDir}/*.md`, { cwd }).sort();

  for (const fileIndex in files) {
    const file = files[fileIndex];
    if (path.basename(file) === 'index.md') continue;
    const sidebarItem = getSidebarItem(contentRoot, file, baseLink);
    sidebarItems.push(sidebarItem);
  }

  return sidebarItems;
}

function getSidebarItem(contentRoot, file: string, baseLink): DefaultTheme.SidebarItem {
  const fileName = path.basename(file, '.md');
  const pageName = getPageName(fileName);

  const fileContent = fs.readFileSync(path.join(contentRoot, file), 'utf8');
  const { data: frontmatter } = matter(fileContent);

  const sidebarItem: DefaultTheme.SidebarItem = {
    text: frontmatter.title || pageName,
    link: path.posix.join("/", baseLink, file.replace(/\d+-/g, '').replaceAll('\\', '/'))
  };

  return sidebarItem;
}

function getPageName(fileName: string, doWordsSplit: boolean = true): string {
  const replacedFileName = fileName.replace(/^\d+-/, '');
  if (!doWordsSplit) return replacedFileName;

  return replacedFileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getNavBarItems(contentDir: string, appendNavBarWithContentDir: boolean = true, exclude: string = ''): DefaultTheme.NavItemWithLink[] {

  const navBarItems: DefaultTheme.NavItemWithLink[] = [];
  const cwd = `${process.cwd()}/${contentRoot}`;

  const dirs = glob.sync(`${contentDir}/*/`, { cwd }).sort();

  for (const dirIndex in dirs) {
    const dir = dirs[dirIndex];

    const text = getPageName(path.basename(dir), false);
    const link = appendNavBarWithContentDir ? `/${contentDir}/${text}/` : `/${text}/`;

    if (text === exclude) continue;

    navBarItems.push({ text, link });
  }

  return navBarItems;

}

function getDynamicSinglePageNavItems(sectionType: 'products' | 'api'): DefaultTheme.NavItemWithLink[] {
  const navBarItems: DefaultTheme.NavItemWithLink[] = [];
  const cwd = `${process.cwd()}/${contentRoot}`;
  const contentDir = `${sectionType}/`;

  const dirs = glob.sync(`${contentDir}/*/`, { cwd }).sort();

  for (const dirIndex in dirs) {
    const dir = dirs[dirIndex];
    const productName = path.basename(dir);
    const cleanName = productName.replace(/^\d+-/, '');
    const displayName = getPageName(productName, false);
    
    // Skip if no content exists
    const productPath = path.join(cwd, dir);
    if (!fs.existsSync(productPath)) continue;
    
    // Check if there are any markdown files in the product directory
    const hasContent = hasMarkdownContent(productPath);
    if (!hasContent) continue;
    
    const text = `${displayName} (одна страница)`;
    
    // New URL structure: /product-name/single-page or /api/product-name/single-page
    let link: string;
    if (sectionType === 'api') {
      link = `/api/${cleanName}/single-page`;
    } else {
      link = `/${cleanName}/single-page`;
    }

    navBarItems.push({ text, link });
  }

  return navBarItems;
}

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

function generateAllSinglePages(): void {
  console.log('Generating single-page documentation for all products and APIs...');
  
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
      
      // Check if product has markdown content
      if (hasMarkdownContent(productPath)) {
        try {
          createSinglePageDocumentation(sectionType, productName);
        } catch (error) {
          console.warn(`Failed to generate single-page for ${sectionType}/${productName}: ${error.message}`);
        }
      }
    }
  }
  
  console.log('Single-page documentation generation complete.');
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

function getSinglePageSidebars(): DefaultTheme.SidebarMulti {
  const sidebars: DefaultTheme.SidebarMulti = {};
  const cwd = `${process.cwd()}/${contentRoot}`;
  
  // Generate sidebars for products
  const productDirs = glob.sync(`products/*/`, { cwd }).sort();
  for (const dirIndex in productDirs) {
    const dir = productDirs[dirIndex].replaceAll('\\', '/');
    const productName = path.basename(dir);
    const cleanName = productName.replace(/^\d+-/, '');
    
    // Check if product has content
    const productPath = path.join(cwd, dir);
    if (!hasMarkdownContent(productPath)) continue;
    
    const singlePageRoute = `/${cleanName}/single-page`;
    sidebars[singlePageRoute] = generateSinglePageSidebar('products', productName, singlePageRoute);
  }
  
  // Generate sidebars for APIs
  const apiDirs = glob.sync(`api/*/`, { cwd }).sort();
  for (const dirIndex in apiDirs) {
    const dir = apiDirs[dirIndex].replaceAll('\\', '/');
    const productName = path.basename(dir);
    const cleanName = productName.replace(/^\d+-/, '');
    
    // Check if API has content
    const apiPath = path.join(cwd, dir);
    if (!hasMarkdownContent(apiPath)) continue;
    
    const singlePageRoute = `/api/${cleanName}/single-page`;
    sidebars[singlePageRoute] = generateSinglePageSidebar('api', productName, singlePageRoute);
  }
  
  return sidebars;
}

function getToggleModeNavItems(): { products: DefaultTheme.NavItemWithLink[], api: DefaultTheme.NavItemWithLink[] } {
  const cwd = `${process.cwd()}/${contentRoot}`;
  const productItems: DefaultTheme.NavItemWithLink[] = [];
  const apiItems: DefaultTheme.NavItemWithLink[] = [];
  
  // Generate navigation for products in toggle mode
  const productDirs = glob.sync(`products/*/`, { cwd }).sort();
  for (const dirIndex in productDirs) {
    const dir = productDirs[dirIndex];
    const productName = path.basename(dir);
    const cleanName = productName.replace(/^\d+-/, '');
    const displayName = getPageName(productName, false);
    
    // Check if product has content
    const productPath = path.join(cwd, dir);
    if (!hasMarkdownContent(productPath)) continue;
    
    const link = `/single-page/${cleanName}`;
    productItems.push({ text: displayName, link });
  }
  
  // Generate navigation for APIs in toggle mode
  const apiDirs = glob.sync(`api/*/`, { cwd }).sort();
  for (const dirIndex in apiDirs) {
    const dir = apiDirs[dirIndex];
    const productName = path.basename(dir);
    const cleanName = productName.replace(/^\d+-/, '');
    const displayName = getPageName(productName, false);
    
    // Check if API has content
    const apiPath = path.join(cwd, dir);
    if (!hasMarkdownContent(apiPath)) continue;
    
    const link = `/single-page/api/${cleanName}`;
    apiItems.push({ text: displayName, link });
  }
  
  return { products: productItems, api: apiItems };
}

function getToggleModeSidebars(): DefaultTheme.SidebarMulti {
  const sidebars: DefaultTheme.SidebarMulti = {};
  const cwd = `${process.cwd()}/${contentRoot}`;
  
  // Generate sidebars for products in toggle mode
  const productDirs = glob.sync(`products/*/`, { cwd }).sort();
  for (const dirIndex in productDirs) {
    const dir = productDirs[dirIndex].replaceAll('\\', '/');
    const productName = path.basename(dir);
    const cleanName = productName.replace(/^\d+-/, '');
    
    // Check if product has content
    const productPath = path.join(cwd, dir);
    if (!hasMarkdownContent(productPath)) continue;
    
    const toggleRoute = `/single-page/${cleanName}`;
    sidebars[toggleRoute] = generateSinglePageSidebar('products', productName, toggleRoute);
  }
  
  // Generate sidebars for APIs in toggle mode
  const apiDirs = glob.sync(`api/*/`, { cwd }).sort();
  for (const dirIndex in apiDirs) {
    const dir = apiDirs[dirIndex].replaceAll('\\', '/');
    const productName = path.basename(dir);
    const cleanName = productName.replace(/^\d+-/, '');
    
    // Check if API has content
    const apiPath = path.join(cwd, dir);
    if (!hasMarkdownContent(apiPath)) continue;
    
    const toggleRoute = `/single-page/api/${cleanName}`;
    sidebars[toggleRoute] = generateSinglePageSidebar('api', productName, toggleRoute);
  }
  
  return sidebars;
}

function generateSinglePageSidebar(sectionType: 'products' | 'api', productName: string, baseRoute: string): DefaultTheme.SidebarItem[] {
  const sidebar: DefaultTheme.SidebarItem[] = [];
  const basePath = `docs/${sectionType}/${productName}`;
  
  if (!fs.existsSync(basePath)) {
    return sidebar;
  }
  
  // Get the clean product name for consistent processing
  const cleanProductName = productName.replace(/^\d+-/, '');
  
  // For API documentation, get all actual directories instead of predefined ones
  if (sectionType === 'api') {
    const items = fs.readdirSync(basePath, { withFileTypes: true });
    const directories = items
      .filter(item => item.isDirectory() && !item.name.startsWith('.'))
      .map(item => item.name)
      .sort();
    
    for (const dirName of directories) {
      const dirPath = path.join(basePath, dirName);
      const dirItems = processSinglePageDirectory(dirPath, baseRoute);
      
      if (dirItems.length > 0) {
        // Remove number prefix and clean up directory name for title
        const dirTitle = getPageName(dirName);
        
        sidebar.push({
          text: dirTitle,
          items: dirItems,
          collapsed: false
        });
      }
    }
    
    // For API, also process root files including index.md
    const rootItems = processSinglePageDirectory(basePath, baseRoute, true, false); // includeIndex = true
    if (rootItems.length > 0) {
      sidebar.unshift(...rootItems);
    }
  } else {
    // For products, check if this is a single-file product (only has index.md)
    const items = fs.readdirSync(basePath, { withFileTypes: true });
    const markdownFiles = items.filter(item => item.isFile() && item.name.endsWith('.md') && item.name !== 'single-page.md');
    const directories = items.filter(item => item.isDirectory() && !item.name.startsWith('.'));
    
    // If only has index.md and no subdirectories, generate sidebar from content headings
    if (markdownFiles.length === 1 && markdownFiles[0].name === 'index.md' && directories.length === 0) {
      const indexPath = path.join(basePath, 'index.md');
      const sidebarFromHeadings = generateSidebarFromHeadings(indexPath, baseRoute);
      sidebar.push(...sidebarFromHeadings);
    } else {
      // For products with multiple files/directories, use the predefined directories
      const predefinedDirs = ['getting-started', 'framework-elements', 'api', 'examples', 'guides', 'reference'];
      
      for (const dirName of predefinedDirs) {
        const dirPath = path.join(basePath, dirName);
        if (!fs.existsSync(dirPath)) continue;
        
        const dirItems = processSinglePageDirectory(dirPath, baseRoute);
        if (dirItems.length > 0) {
          // Get directory title
          let dirTitle = dirName;
          if (dirName === 'getting-started') {
            dirTitle = 'Начало работы';
          } else if (dirName === 'framework-elements') {
            dirTitle = 'Использование фреймворка';
          } else if (dirName === 'api') {
            dirTitle = 'API';
          } else {
            dirTitle = getPageName(dirName);
          }
          
          sidebar.push({
            text: dirTitle,
            items: dirItems,
            collapsed: false
          });
        }
      }
      
      // Process any files in the root directory
      const rootItems = processSinglePageDirectory(basePath, baseRoute, true);
      if (rootItems.length > 0) {
        sidebar.push(...rootItems);
      }
    }
  }
  
  return sidebar;
}

function generateSidebarFromHeadings(filePath: string, baseRoute: string): DefaultTheme.SidebarItem[] {
  const items: DefaultTheme.SidebarItem[] = [];
  
  if (!fs.existsSync(filePath)) {
    return items;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const { content: markdownContent } = matter(content);
  
  // Extract headings (h1-h6) from markdown content
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length; // Number of # characters
    const text = match[2].trim();
    
    // Skip h1 headings as they are typically page titles
    if (level === 1) continue;
    
    // Create proper anchor for the heading
    const anchor = text.toLowerCase()
      .replace(/[^\wа-яё\s-]/g, '') // Keep Cyrillic characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    
    items.push({
      text: text,
      link: `${baseRoute}#${anchor}`
    });
  }
  
  return items;
}

function processSinglePageDirectory(directory: string, baseRoute: string, rootOnly: boolean = false, includeIndex: boolean = false): DefaultTheme.SidebarItem[] {
  const items: DefaultTheme.SidebarItem[] = [];
  
  if (!fs.existsSync(directory)) {
    return items;
  }
  
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  // Process markdown files
  const markdownFiles = files
    .filter(item => {
      if (!item.isFile() || !item.name.endsWith('.md')) return false;
      if (item.name === 'index.md' && !includeIndex) return false; // Skip index.md unless explicitly included
      return true;
    })
    .map(item => item.name)
    .sort();
  
  for (const filename of markdownFiles) {
    const filePath = path.join(directory, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(content);
    
    const title = frontmatter.title || getPageName(filename.replace('.md', ''));
    
    // Create proper anchor for the title
    const anchor = title.toLowerCase()
      .replace(/[^\wа-яё\s-]/g, '') // Keep Cyrillic characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    
    items.push({
      text: title,
      link: `${baseRoute}#${anchor}`
    });
  }
  
  // Process subdirectories recursively if not rootOnly
  if (!rootOnly) {
    const subdirs = files
      .filter(item => item.isDirectory() && !item.name.startsWith('.'))
      .map(item => item.name)
      .sort();
    
    for (const subdir of subdirs) {
      const subdirPath = path.join(directory, subdir);
      const subdirItems = processSinglePageDirectory(subdirPath, baseRoute);
      
      if (subdirItems.length > 0) {
        items.push({
          text: getPageName(subdir),
          items: subdirItems,
          collapsed: false
        });
      }
    }
  }
  
  return items;
}

function generateAllSidebarConfigurations(): DefaultTheme.SidebarMulti {
  const sidebarConfig: DefaultTheme.SidebarMulti = {};
  
  // Get all individual sidebar configurations
  const toggleSidebars = getToggleModeSidebars();
  const singlePageSidebars = getSinglePageSidebars();
  const productSidebars = getSidebars('products/', false, 'autumn');
  const apiSidebars = getSidebars('api/');
  
  // Create ordered array of sidebar entries from most specific to least specific
  const sidebarEntries: [string, any][] = [];
  
  // 1. Toggle mode single-page routes (most specific)
  for (const [route, sidebar] of Object.entries(toggleSidebars)) {
    sidebarEntries.push([route, sidebar]);
  }
  
  // 2. Regular single-page routes (very specific)
  for (const [route, sidebar] of Object.entries(singlePageSidebars)) {
    sidebarEntries.push([route, sidebar]);
  }
  
  // 3. Specific longer product and API routes first (autumn-collections before autumn)
  const allRoutes = [
    ...Object.entries(productSidebars),
    ...Object.entries(apiSidebars)
  ];
  
  // Sort by route length (descending) to ensure longer/more specific routes come first
  allRoutes.sort(([routeA], [routeB]) => routeB.length - routeA.length);
  
  for (const [route, sidebar] of allRoutes) {
    sidebarEntries.push([route, sidebar]);
  }
  
  // 4. Add specific autumn framework routes
  sidebarEntries.push(["/getting-started/", getSidebar({
    contentRoot: contentRoot + 'products/000-autumn/',
    contentDirs: [
      { text: 'Начало работы', dir: 'getting-started' },
      { text: 'Использование фреймворка', dir: 'framework-elements' },
    ],
    collapsed: false,
    baseLink: ""
  })]);
  
  sidebarEntries.push(["/framework-elements/", getSidebar({
    contentRoot: contentRoot + 'products/000-autumn/',
    contentDirs: [
      { text: 'Начало работы', dir: 'getting-started' },
      { text: 'Использование фреймворка', dir: 'framework-elements' },
    ],
    collapsed: false,
    baseLink: ""
  })]);
  
  // 5. Finally add the root catch-all (least specific)
  sidebarEntries.push(["/", getSidebar({
    contentRoot: contentRoot + 'products/000-autumn/',
    contentDirs: [
      { text: 'Начало работы', dir: 'getting-started' },
      { text: 'Использование фреймворка', dir: 'framework-elements' },
    ],
    collapsed: false,
    baseLink: ""
  })]);
  
  // Build the final configuration maintaining order
  for (const [route, sidebar] of sidebarEntries) {
    sidebarConfig[route] = sidebar;
  }
  
  return sidebarConfig;
}