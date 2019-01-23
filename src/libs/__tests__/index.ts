import { getTree } from 'src/contrib/typed-baobab';

import { arePropsEqual } from '../state';

const tree = getTree({ path1: 'test', path2: 'test' }, {});

it('arePropsEqual returns true for the same objects', () => {
    const props1 = {
        key: 'value',
    };
    const props2 = {
        key: 'value',
    };

    expect(arePropsEqual(props1, props2)).toBeTruthy();
});

it('arePropsEqual returns false for not the same objects', () => {
    const props1 = {
        key: 'value1',
    };
    const props2 = {
        key: 'value',
    };

    expect(arePropsEqual(props1, props2)).toBeFalsy();
});

it('arePropsEqual returns true for the same objects with cursors', () => {
    const props1 = {
        tree: tree.path1,
    };
    const props2 = {
        tree: tree.path1,
    };

    expect(arePropsEqual(props1, props2)).toBeTruthy();
});

it('arePropsEqual returns true for the same objects with different cursors', () => {
    const props1 = {
        tree: tree.path1,
    };
    const props2 = {
        tree: tree.path2,
    };

    expect(arePropsEqual(props1, props2)).toBeFalsy();
});
