import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
    flattenRepositories,
    getRepositoryGroups,
    groupNavItems,
    readRepositories,
    type NavLink,
    type RepositoriesEntry
} from '../repositories.ts'

describe('flattenRepositories', () => {

    it('оставляет плоский список без изменений', () => {
        const entries: RepositoriesEntry[] = [
            { organization: 'autumn-library', repository: 'autumn' },
            { organization: 'autumn-library', repository: 'winow' }
        ]

        assert.deepEqual(flattenRepositories(entries), [
            { organization: 'autumn-library', repository: 'autumn' },
            { organization: 'autumn-library', repository: 'winow' }
        ])
    })

    it('разворачивает группу в репозитории с именем группы', () => {
        const entries: RepositoriesEntry[] = [
            {
                group: 'opentelemetry',
                repositories: [
                    { organization: 'nixel2007', repository: 'opentelemetry' },
                    { organization: 'autumn-library', repository: 'autumn-opentelemetry' }
                ]
            }
        ]

        assert.deepEqual(flattenRepositories(entries), [
            { organization: 'nixel2007', repository: 'opentelemetry', group: 'opentelemetry' },
            { organization: 'autumn-library', repository: 'autumn-opentelemetry', group: 'opentelemetry' }
        ])
    })

    it('сохраняет порядок репозиториев и групп, заданный в файле', () => {
        const entries: RepositoriesEntry[] = [
            { organization: 'autumn-library', repository: 'autumn' },
            {
                group: 'opentelemetry',
                repositories: [
                    { organization: 'nixel2007', repository: 'opentelemetry' },
                    { organization: 'nixel2007', repository: 'opentelemetry-propagator-b3' }
                ]
            },
            { organization: 'autumn-library', repository: 'winow' }
        ]

        assert.deepEqual(flattenRepositories(entries).map(repository => repository.repository), [
            'autumn',
            'opentelemetry',
            'opentelemetry-propagator-b3',
            'winow'
        ])
    })

    it('пропускает пустые группы', () => {
        const entries: RepositoriesEntry[] = [
            { group: 'opentelemetry', repositories: [] },
            { organization: 'autumn-library', repository: 'autumn' }
        ]

        assert.deepEqual(flattenRepositories(entries), [
            { organization: 'autumn-library', repository: 'autumn' }
        ])
    })

})

describe('getRepositoryGroups', () => {

    it('возвращает пустую карту, если групп нет', () => {
        const entries: RepositoriesEntry[] = [
            { organization: 'autumn-library', repository: 'autumn' }
        ]

        assert.deepEqual(getRepositoryGroups(entries), new Map())
    })

    it('сопоставляет репозиторий и его группу', () => {
        const entries: RepositoriesEntry[] = [
            { organization: 'autumn-library', repository: 'autumn' },
            {
                group: 'opentelemetry',
                repositories: [
                    { organization: 'nixel2007', repository: 'opentelemetry' },
                    { organization: 'autumn-library', repository: 'autumn-opentelemetry' }
                ]
            }
        ]

        assert.deepEqual(getRepositoryGroups(entries), new Map([
            ['opentelemetry', 'opentelemetry'],
            ['autumn-opentelemetry', 'opentelemetry']
        ]))
    })

})

describe('groupNavItems', () => {

    const autumn: NavLink = { text: 'autumn', link: '/autumn/' }
    const winow: NavLink = { text: 'winow', link: '/winow/' }
    const otel: NavLink = { text: 'opentelemetry', link: '/opentelemetry/' }
    const otelB3: NavLink = { text: 'opentelemetry-propagator-b3', link: '/opentelemetry-propagator-b3/' }
    const autumnOtel: NavLink = { text: 'autumn-opentelemetry', link: '/autumn-opentelemetry/' }

    it('оставляет пункты без группы как есть', () => {
        const items = groupNavItems([autumn, winow], new Map())

        assert.deepEqual(items, [autumn, winow])
    })

    it('собирает пункты одной группы в подраздел выпадающего меню', () => {
        const groups = new Map([
            ['opentelemetry', 'opentelemetry'],
            ['opentelemetry-propagator-b3', 'opentelemetry']
        ])

        const items = groupNavItems([autumn, otel, otelB3, winow], groups)

        assert.deepEqual(items, [
            autumn,
            { text: 'opentelemetry', items: [otel, otelB3] },
            winow
        ])
    })

    it('ставит группу на место первого её пункта и сохраняет порядок внутри', () => {
        const groups = new Map([
            ['opentelemetry', 'opentelemetry'],
            ['autumn-opentelemetry', 'opentelemetry']
        ])

        const items = groupNavItems([autumnOtel, winow, otel, autumn], groups)

        assert.deepEqual(items, [
            { text: 'opentelemetry', items: [autumnOtel, otel] },
            winow,
            autumn
        ])
    })

    it('не трогает исходный массив', () => {
        const source = [autumn, otel]
        groupNavItems(source, new Map([['opentelemetry', 'opentelemetry']]))

        assert.deepEqual(source, [autumn, otel])
    })

    it('игнорирует репозитории группы, для которых нет документации', () => {
        const groups = new Map([
            ['opentelemetry', 'opentelemetry'],
            ['opentelemetry-instrumentation-entity', 'opentelemetry']
        ])

        const items = groupNavItems([autumn, otel], groups)

        assert.deepEqual(items, [
            autumn,
            { text: 'opentelemetry', items: [otel] }
        ])
    })

    it('поддерживает несколько групп одновременно', () => {
        const groups = new Map([
            ['opentelemetry', 'opentelemetry'],
            ['prometheus', 'prometheus'],
            ['prometheus-metrics', 'prometheus']
        ])

        const items = groupNavItems([
            autumn,
            otel,
            { text: 'prometheus', link: '/prometheus/' },
            { text: 'prometheus-metrics', link: '/prometheus-metrics/' }
        ], groups)

        assert.deepEqual(items, [
            autumn,
            { text: 'opentelemetry', items: [otel] },
            {
                text: 'prometheus',
                items: [
                    { text: 'prometheus', link: '/prometheus/' },
                    { text: 'prometheus-metrics', link: '/prometheus-metrics/' }
                ]
            }
        ])
    })

})

describe('repositories.json', () => {

    const entries = readRepositories()

    it('содержит только репозитории и непустые группы', () => {
        for (const entry of entries) {
            if ('group' in entry) {
                assert.equal(typeof entry.group, 'string')
                assert.ok(entry.group.length > 0, 'имя группы не должно быть пустым')
                assert.ok(Array.isArray(entry.repositories), `${entry.group}: группа должна содержать репозитории`)
                assert.ok(entry.repositories.length > 0, `${entry.group}: группа не должна быть пустой`)
                continue
            }

            assert.ok(entry.organization, 'у репозитория должна быть организация')
            assert.ok(entry.repository, 'у репозитория должно быть имя')
        }
    })

    it('не содержит дублей репозиториев', () => {
        const names = flattenRepositories(entries).map(repository => repository.repository)

        assert.deepEqual(names, [...new Set(names)])
    })

    it('относит все пакеты opentelemetry к группе opentelemetry', () => {
        const opentelemetryRepositories = flattenRepositories(entries).filter(
            repository => repository.repository.includes('opentelemetry')
        )

        assert.ok(opentelemetryRepositories.length > 0)

        for (const repository of opentelemetryRepositories) {
            assert.equal(
                repository.group,
                'opentelemetry',
                `${repository.repository} должен быть в группе opentelemetry`
            )
        }
    })

})
