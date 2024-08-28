/*global define, describe, it, expect */
define([
    'eso-topologylib/nodechart/NodeChart'
], function (NodeChart) {
    'use strict';

    describe('MyWidget', function () {

        it('NodeChart should be defined', function () {
            expect(NodeChart).not.to.be.undefined;
        });

    });

});
