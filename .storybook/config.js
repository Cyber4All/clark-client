import { configure } from '@storybook/angular';
import '../src/globals.scss';
import '../src/_vars.scss';

configure(require.context('../src', true, /\.stories\.[tj]s$/), module);
