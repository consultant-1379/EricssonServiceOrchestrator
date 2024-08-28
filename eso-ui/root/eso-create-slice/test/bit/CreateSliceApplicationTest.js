/*global define, describe, before, after, beforeEach, afterEach, it, expect */
define([
    'eso-create-slice/CreateSliceApplication'
], function (CreateSliceApplication) {
    'use strict';

    describe('CreateSliceApplication', function () {

        it('Sample BIT test', function () {
            expect(CreateSliceApplication).not.to.be.undefined;
        });

    });

});
