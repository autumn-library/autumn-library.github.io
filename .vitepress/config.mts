import { DefaultTheme, defineConfig } from 'vitepress'
import { glob } from 'glob';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

const bslLanguage = JSON.parse(fs.readFileSync('docs/bsl.json', 'utf8'))

// https://vitepress.dev/reference/site-config
export default defineConfig({

  appearance: 'dark',
  markdown: {
    languages: [bslLanguage],
  },
  
  title: "Autumn Docs",
  description: "Это документация для Autumn - DI framework для OneScript",
  lang: 'ru-RU',

  srcDir: 'docs',
  
  // https://vitepress.dev/reference/site-config#base
  base: "/docs",

  rewrites(id) {
    return id.replace(/\d+-/, '').replace(/\\/, '/')
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
      { text: 'Использование фреймворка', dir: 'framework-elements' },
      ],
      collapsed: false,
    }),

    editLink: {
      pattern: 'https://github.com/autumn-library/docs/edit/master/docs/:path'
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/autumn-library/autumn' },
      { 
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 10 50 50"><path d="M36,12c13.255,0,24,10.745,24,24S49.255,60,36,60S12,49.255,12,36S22.745,12,36,12z M44.279,45.783	c0.441-1.354,2.51-14.853,2.765-17.513c0.077-0.806-0.177-1.341-0.676-1.58c-0.603-0.29-1.496-0.145-2.533,0.229	c-1.421,0.512-19.59,8.227-20.64,8.673c-0.995,0.423-1.937,0.884-1.937,1.552c0,0.47,0.279,0.734,1.047,1.008	c0.799,0.285,2.812,0.895,4.001,1.223c1.145,0.316,2.448,0.042,3.178-0.412c0.774-0.481,9.71-6.46,10.351-6.984	c0.641-0.524,1.152,0.147,0.628,0.672c-0.524,0.524-6.657,6.477-7.466,7.301c-0.982,1.001-0.285,2.038,0.374,2.453	c0.752,0.474,6.163,4.103,6.978,4.685c0.815,0.582,1.641,0.846,2.398,0.846S43.902,46.94,44.279,45.783z"></path></svg>'
        },
        link: 'https://t.me/autumn_winow' 
      }
   ]
  },

})

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
    link: "/" + file.replace(/\d+-/, '').replace(/\\/, '/')
  };

  return sidebarItem;
}
