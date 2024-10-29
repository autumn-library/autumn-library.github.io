import { DefaultTheme, defineConfig } from 'vitepress'
// import { getSidebar } from 'vitepress-plugin-auto-sidebar'
import { glob } from 'glob';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import hljs from 'highlight.js';

// https://vitepress.dev/reference/site-config
export default defineConfig({

  appearance:'force-dark',
  markdown: {
    // https://github.com/markdown-it/markdown-it#syntax-highlighting
    highlight(str: string, lang: string, attrs: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch {}
      }

      return '';
    },
  },
  
  title: "Autumn Docs",
  description: "Это документация для Autumn - DI framework для OneScript",
  lang: 'ru-RU',

  srcDir: 'docs',
  
  rewrites: {
    ':path/:order(\\d+-):page': ':path/:page',
    ':path/:page': ':path/:page',
  },

  cleanUrls: true,

  locales: {
    root: {
      label: 'Русский',
      lang: 'ru'
    },

  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    logo: 'acorn-ol.png',

    nav: [
      { text: 'Главная', link: '/' },
      { text: 'Документация', link: '/getting-started/about-autumn' }
    ],

    sidebar: getSidebar({
      contentRoot: 'docs/',
      contentDirs: [
      { text: 'Начало работы', dir: 'getting-started' },
      { text: 'Использование фреймворка', dir: 'framework-elements' }
      ],
      collapsed: false,
    }),

    editLink: {
      pattern: 'https://github.com/autumn-library/docs/edit/main/docs/:path'
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/autumn-library/autumn' }
   ]
  },

})

// migrate this to typescript and DefaultTheme.Sidebar

interface SidebarOptions {
  contentRoot: string;
  contentDirs: { text: string; dir: string }[];
  collapsed: boolean;
}

function getSidebar({ contentRoot, contentDirs, collapsed }: SidebarOptions): DefaultTheme.SidebarItem[] {
  const sidebar: DefaultTheme.SidebarItem[] = [];

  for (const contentDir of contentDirs) {
    const sidebarConfig = getSidebarConfig(contentRoot, contentDir.dir, contentDir.text, collapsed);
    sidebar.push(sidebarConfig);
  }

  return sidebar;
}


function getSidebarConfig(contentRoot, contentDir, text, collapsed): DefaultTheme.SidebarItem {
  const sidebarConfig: DefaultTheme.SidebarItem = {
    text,
    items: getSidebarItems(contentRoot, contentDir),
    collapsed
  };

  return sidebarConfig;
}

function getSidebarItems(contentRoot, contentDir): DefaultTheme.SidebarItem[] {
  const sidebarItems: DefaultTheme.SidebarItem[] = [];
  const cwd = `${process.cwd()}/${contentRoot}`;
  const files = glob.sync(`${contentDir}/*.md`, { cwd }).sort();
  
  for (const path in files) {
    const file = files[path];
    const sidebarItem = getSidebarItem(contentRoot, file);
    sidebarItems.push(sidebarItem);
  }


  return sidebarItems;
}

function getSidebarItem(contentRoot, file): DefaultTheme.SidebarItem {
  const fileName = path.basename(file, '.md');
  const pageName = fileName
    .replace(/^\d+-/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const fileContent = fs.readFileSync(path.join(contentRoot, file), 'utf8');
  const { data: frontmatter } = matter(fileContent);

  const sidebarItem: DefaultTheme.SidebarItem = {
    text: frontmatter.title || pageName,
    link: file.replace(/\/\d+-/, '/'),
    // order: frontmatter.order || 0
  };

  return sidebarItem;
}
