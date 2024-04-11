import { EmbeddedScene, PanelBuilders, SceneApp, SceneAppPage, SceneDataTransformer, SceneFlexItem, SceneFlexLayout, SceneQueryRunner } from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';
import { TableCellBackgroundDisplayMode, TableCellDisplayMode, ThresholdsMode } from '@grafana/schema';

export const MY_DATASOURCE_REF = {
  uid: 'grafana-aitraining-app-datasource-uid',
  type: 'testdata',
};

const roomsTemperatureQuery = {
  refId: 'Rooms temperature',
  datasource: MY_DATASOURCE_REF,
  scenarioId: 'random_walk',
  seriesCount: 8,
  alias: '__house_locations',
  min: 10,
  max: 27,
};

export function getRoomsTemperatureTable() {
  const data = new SceneDataTransformer({
    transformations: []});

  return PanelBuilders.table()
    .setTitle('Room temperature overview')
    .setData(data)
    .setHoverHeader(true)
    .setDisplayMode('transparent')
    .setOption('sortBy', [{ displayName: 'Average temperature' }])
    .setThresholds({
      mode: ThresholdsMode.Absolute,
      steps: [
        {
          color: 'light-blue',
          value: 0,
        },
        {
          color: 'orange',
          value: 19,
        },
        {
          color: 'dark-red',
          value: 26,
        },
      ],
    })
    .setColor({ mode: 'thresholds' })
    .setCustomFieldConfig('align', 'auto')
    .setCustomFieldConfig('cellOptions', { type: TableCellDisplayMode.Auto })
    .setCustomFieldConfig('inspect', false)
    .setOverrides((b) =>
      b
        .matchFieldsWithName('Average temperature')
        .overrideUnit('celsius')
        .overrideCustomFieldConfig('cellOptions', {
          type: TableCellDisplayMode.ColorBackground,
          mode: TableCellBackgroundDisplayMode.Basic,
        })
        .overrideCustomFieldConfig('width', 200)
        .overrideCustomFieldConfig('align', 'center')
        .matchFieldsWithName('Room')
        .overrideLinks([
          { title: 'Go to room overview', url: '${__url.path}/room/${__value.text}/temperature${__url.params}' },
        ])
    )
    .build();
}


const getTab1Scene = () =>
  new EmbeddedScene({ 
    $data: new SceneQueryRunner({
      datasource: MY_DATASOURCE_REF,
      queries: [roomsTemperatureQuery],
      maxDataPoints: 100,
    }),

    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          height: 300,
          body: getRoomsTemperatureTable(),
        }),
        // new SceneFlexItem({
        //   ySizing: 'fill',
        //   body: getRoomsTemperatureStats(),
        // }),
      ],
    }),
  });

const getTab2Scene = () => {
  return new EmbeddedScene({
    body: new SceneFlexLayout({
      children: [
        new SceneFlexItem({
          width: '100%',
          height: 300,
          body: PanelBuilders.text().setTitle('Hello world panel').setOption('content', 'Hello world!').build(),
        }),
      ],
    }),
  });};

export const getScene = () => {
  return new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'AI Training Observability',
        // Important: Mind the page route is unambiguous for the tabs to work properly
        url: prefixRoute(`${ROUTES.Home}`),
        hideFromBreadcrumbs: true,
        getScene: getTab1Scene,
        tabs: [
          new SceneAppPage({
            title: 'Project name',
            url: prefixRoute(`${ROUTES.Home}`),
            getScene: getTab1Scene,

          }),
          new SceneAppPage({
            title: 'Imma title',
            url: prefixRoute(`${ROUTES.Home}/tab-two`),
            getScene: getTab2Scene,
          }),
        ],
      }),
    ],
  });
}