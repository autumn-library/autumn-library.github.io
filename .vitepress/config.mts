import { DefaultTheme, defineConfig } from 'vitepress'
import { glob } from 'glob';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

const contentRoot = 'docs/';

// https://vitepress.dev/reference/site-config
export default defineConfig({

  vite: {
    resolve: {
      preserveSymlinks: true
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
    /^https?:\/\/localhost/
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    logo: 'acorn-ol.png',

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
    ],

    sidebar: {
      // products
      "/": getSidebar({
        contentRoot: contentRoot + 'products/000-autumn/',
        contentDirs: [
          { text: 'Начало работы', dir: 'getting-started' },
          { text: 'Использование фреймворка', dir: 'framework-elements' },
        ],
        collapsed: false,
      }),
      ...getSidebars('products/', false, 'autumn'),
      ...getSidebars('api/'),
    },

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
      pattern: 'https://github.com/autumn-library/docs/edit/master/docs/:path',
      text: 'Редактировать страницу'
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

interface SidebarOptions {
  contentRoot: string;
  contentDirs: { text: string; dir: string; }[];
  collapsed: boolean;
}

function getSidebars(contentDir: string, appendSideBarWithContentDir: boolean = true, excluded: string = ''): DefaultTheme.SidebarMulti {

  const sidebars: DefaultTheme.SidebarMulti = {};

  const cwd = `${process.cwd()}/${contentRoot}`;

  const dirs = glob.sync(`${contentDir}/*/`, { cwd }).sort();
  for (const dirIndex in dirs) {
    const dir = dirs[dirIndex];
  
    const text = getPageName(path.basename(dir), false);
    const link = appendSideBarWithContentDir ? `/${contentDir}${text}/` : `/${text}/`;

    if (text === excluded) continue;

    sidebars[link] = getSidebar({
      contentRoot: contentRoot + dir + '/',
      contentDirs: [
        { text, dir: "." }
      ],
      collapsed: false,
    });
  }

  return sidebars;

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
  const indexPath = `${contentDir}/index.md`.replaceAll('\\', '/');
  const link = fs.existsSync(`${contentRoot}${indexPath}`) ? `/${indexPath}` : ''

  const sidebarConfig: DefaultTheme.SidebarItem = {
    text,
    items: getSidebarItems(contentRoot, contentDir),
    collapsed,
    link: link
  };

  return sidebarConfig;
}

function getSidebarItems(contentRoot, contentDir): DefaultTheme.SidebarItem[] {
  const sidebarItems: DefaultTheme.SidebarItem[] = [];
  const cwd = `${process.cwd()}/${contentRoot}`;

  const dirs = glob.sync(`${contentDir}/*/`, { cwd }).sort();
  for (const dirIndex in dirs) {
    const dir = dirs[dirIndex];
    const indexPath = `${dir}/index.md`.replaceAll('\\', '/');
    const link = fs.existsSync(`${contentRoot}/${indexPath}`) ? `/${indexPath}` : ''

    sidebarItems.push({
      text: getPageName(path.basename(dir)),
      items: getSidebarItems(contentRoot, dir.replaceAll('\\', '/')),
      collapsed: false,
      link: link
    });
  }

  const files = glob.sync(`${contentDir}/*.md`, { cwd }).sort();

  for (const fileIndex in files) {
    const file = files[fileIndex];
    if (path.basename(file) === 'index.md') continue;
    const sidebarItem = getSidebarItem(contentRoot, file);
    sidebarItems.push(sidebarItem);
  }

  return sidebarItems;
}

function getSidebarItem(contentRoot, file: string): DefaultTheme.SidebarItem {
  const fileName = path.basename(file, '.md');
  const pageName = getPageName(fileName);

  const fileContent = fs.readFileSync(path.join(contentRoot, file), 'utf8');
  const { data: frontmatter } = matter(fileContent);

  const sidebarItem: DefaultTheme.SidebarItem = {
    text: frontmatter.title || pageName,
    link: "/" + file.replace(/\d+-/g, '').replaceAll('\\', '/')
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