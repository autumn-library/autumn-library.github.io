/**
 * Разбор repositories.json.
 *
 * На верхнем уровне файла находится либо репозиторий, либо группа
 * репозиториев. Порядок записей определяет порядок разделов документации
 * на сайте, а группа дополнительно собирает свои репозитории
 * в подраздел выпадающего меню.
 */

import * as fs from 'fs';

const REPOSITORIES_FILE = 'repositories.json';

export type RepoData = {
    organization: string;
    repository: string;
};

export type RepoGroup = {
    group: string;
    repositories: RepoData[];
};

export type RepositoriesEntry = RepoData | RepoGroup;

/** Репозиторий с именем группы, в которую он входит. */
export type GroupedRepoData = RepoData & {
    group?: string;
};

export type NavLink = {
    text: string;
    link: string;
};

export type NavGroup = {
    text: string;
    items: NavLink[];
};

export type NavItem = NavLink | NavGroup;

export function isRepoGroup(entry: RepositoriesEntry): entry is RepoGroup {
    return 'group' in entry;
}

/** Читает repositories.json как есть, вместе с группами. */
export function readRepositories(): RepositoriesEntry[] {
    return JSON.parse(fs.readFileSync(REPOSITORIES_FILE, 'utf-8'));
}

/**
 * Разворачивает группы в плоский список репозиториев,
 * сохраняя порядок записей файла.
 */
export function flattenRepositories(entries: RepositoriesEntry[]): GroupedRepoData[] {
    const repositories: GroupedRepoData[] = [];

    for (const entry of entries) {
        if (!isRepoGroup(entry)) {
            repositories.push(entry);
            continue;
        }

        for (const repository of entry.repositories) {
            repositories.push({ ...repository, group: entry.group });
        }
    }

    return repositories;
}

/**
 * Возвращает соответствие "имя репозитория" -> "имя группы"
 * для репозиториев, входящих в группы.
 */
export function getRepositoryGroups(entries: RepositoriesEntry[]): Map<string, string> {
    const groups = new Map<string, string>();

    for (const repository of flattenRepositories(entries)) {
        if (!repository.group) continue;
        groups.set(repository.repository, repository.group);
    }

    return groups;
}

/**
 * Собирает пункты меню в подразделы согласно карте групп.
 *
 * Группа занимает место первого своего пункта, порядок пунктов
 * внутри группы совпадает с порядком исходного списка.
 */
export function groupNavItems(items: NavLink[], groups: Map<string, string>): NavItem[] {
    const navItems: NavItem[] = [];
    const navGroups = new Map<string, NavGroup>();

    for (const item of items) {
        const groupName = groups.get(item.text);

        if (!groupName) {
            navItems.push(item);
            continue;
        }

        let navGroup = navGroups.get(groupName);
        if (!navGroup) {
            navGroup = { text: groupName, items: [] };
            navGroups.set(groupName, navGroup);
            navItems.push(navGroup);
        }

        navGroup.items.push(item);
    }

    return navItems;
}
