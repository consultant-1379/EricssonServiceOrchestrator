/*------------------------------------------------------------------------------
 *******************************************************************************
 * COPYRIGHT Ericsson 2018
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 *----------------------------------------------------------------------------*/

package com.ericsson.eso.services.sort;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.*;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort.Direction;

import com.ericsson.eso.services.api.rest.requestdata.PaginationFilter;
import com.ericsson.eso.services.api.rest.responsedata.ServiceModelResponseData;

/**
 * This class is designed to be generic and can handle models, plugins, & instances.
 * 
 * It provides filtering, sorting, & batching.
 * 
 * @author ekeejos
 *
 */
public class PaginationUtil {

    private static final Logger LOG = LoggerFactory.getLogger(PaginationUtil.class);

    /**
     * This method will filter the data objects against the given parameter.
     * 
     * @param <T>
     * 
     * @param type
     *            the class to filter on.
     * 
     * @param responseObjects
     *            the response objects to filter.
     * @param filterObj
     *            the filter to apply.
     * @return list of filtered objects.
     */
    public static <T> List<T> filter(final List<T> responseObjects, final PaginationFilter filterObj) {

        if (null == filterObj || filterObj.isNull()) {
            return responseObjects;// no filter to apply so return without doing anything
        }

        LOG.info("ESO-LOG:: Filter to be applied is {}", filterObj);

        final List<T> filteredObjects = new ArrayList<>();

        for (final T responseObject : responseObjects) {

            int foundCount = 0;

            for (final Field field : responseObject.getClass().getDeclaredFields()) {

                for (final Entry<String, String> entry : filterObj.getFilters().entrySet()) {

                    if (field.getName().equals(entry.getKey())) {// If the attribute we filter on matches one found in the class proceed
                        final String returnedValue = getReturnValue(responseObject, entry);

                        if (returnedValue.contains(entry.getValue())) {// Check for an actual match based on filter provided
                            foundCount++;
                        }
                    }
                }
            }

            if (foundCount == filterObj.getFilters().entrySet().size()) {// Number of found items for object matches number of entries in filter
                LOG.info("ESO-LOG:: Found responseObject {} that matches filter {}", responseObject, filterObj);
                filteredObjects.add(responseObject);
            }
        }
        return filteredObjects;
    }

    private static <T> String getReturnValue(final T serviceResponseData, final Entry<String, String> entry) {
        String returnedValue = null;
        try {
            final String key = entry.getKey().substring(0, 1).toUpperCase() + entry.getKey().substring(1);
            final Method method = ServiceModelResponseData.class.getMethod("get" + key);
            final Class<?> returnType = method.getReturnType();

            returnedValue = (String) returnType.cast(method.invoke(serviceResponseData));
        } catch (final Exception e) {
            e.printStackTrace();
        }
        return returnedValue;
    }

    /**
     * This method will sort the data objects by the given attribute in the given direction.
     * 
     * @param responseObjects
     *            the objects to sort.
     * @param sortAttr
     *            The attribute to sort by.
     * @param sortDir
     *            The direction of the sort.
     * @return List of sorted objects.
     */
    public static List<ServiceModelResponseData> sort(final List<ServiceModelResponseData> responseObjects, final String sortAttr, final String sortDir) {
        final Comparator<ServiceModelResponseData> methodComparator = PaginationUtil.getComparator(sortAttr, sortDir);

        if (methodComparator != null) {
            Collections.sort(responseObjects, methodComparator);
        } // else return original unsorted list

        return responseObjects;
    }

    /**
     * This method will batch the objects by the given offset and limit.
     * 
     * @param responseObjects
     *            the data objects to batch.
     * @param pageRequest
     *            parameter that holds limit and offset.
     * @return batched list of data objects.
     */
    public static List<ServiceModelResponseData> batch(final List<ServiceModelResponseData> responseObjects, final Integer offset, final Integer limit) {
        if (responseObjects.size() < limit) {
            return responseObjects;// return original list if less than limit
        }

        // If the offset and the limit combined are less than the list size use that as the limit, otherwise use the size as the index to sublist to
        final List<ServiceModelResponseData> subList = responseObjects.subList(offset, (offset + limit) < responseObjects.size() ? (offset + limit) : responseObjects.size());

        return subList;
    }

    private static Comparator<ServiceModelResponseData> getComparator(final String sortAttr, final String sortDir) {
        final Method[] methods = ServiceModelResponseData.class.getMethods();
        String methodToUseForComparator = null;

        for (final Method method : methods) {
            if (method.getName().contains("get") && method.getName().toLowerCase().contains(sortAttr.toLowerCase())) {
                methodToUseForComparator = method.getName();
            }
        }

        Comparator<ServiceModelResponseData> comparator = null;
        try {
            if (methodToUseForComparator != null) {
                comparator = getMethodComparator(ServiceModelResponseData.class, methodToUseForComparator, sortDir);
            }
        } catch (final Exception e) {
            e.printStackTrace();
        }
        return comparator;
    }

    @SuppressWarnings("unchecked")
    private static <T> Comparator<T> getMethodComparator(final Class<T> cls, final String methodName, final String sortDir) throws Exception {
        final Method method = cls.getMethod(methodName);
        final Class<?> returnType = method.getReturnType();
        return methodComparator(method, (Class<? extends Comparable>) returnType, sortDir);
    }

    private static <T, R extends Comparable<R>> Comparator<T> methodComparator(final Method method, final Class<R> returnType, final String sortDir) throws Exception {
        return new Comparator<T>() {
            @Override
            public int compare(final T o1, final T o2) {
                try {
                    final Direction sortDirection = Direction.fromString(sortDir);

                    final R a = returnType.cast(method.invoke(o1));
                    final R b = returnType.cast(method.invoke(o2));

                    if (sortDirection.isDescending()) {
                        return b.compareTo(a);
                    }

                    return a.compareTo(b);
                } catch (final Exception e) {
                    throw new RuntimeException(e);
                }
            }
        };
    }

}
