/*global define, describe, before, after, beforeEach, afterEach, it, expect */
define([
    'eso-service-templates/ServiceTemplatesApplication'
], function (ServiceTemplatesApplication) {
    'use strict';

    describe('ServiceTemplatesApplication', function () {

        it('Sample BIT test', function () {
            expect(ServiceTemplatesApplication).not.to.be.undefined;
        });

    });

});
