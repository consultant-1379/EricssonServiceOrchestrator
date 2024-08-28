package com.ericsson.eso.services.sort;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import com.ericsson.eso.services.api.rest.requestdata.PaginationFilter;
import com.ericsson.eso.services.api.rest.responsedata.ServiceModelResponseData;

public class PaginationUtilTest {

    private final List<ServiceModelResponseData> responseObjects = new ArrayList<>();;
    private PaginationFilter filter;

    @Before
    public void setUp() throws Exception {
        final ServiceModelResponseData serviceModelResponseDataOne = new ServiceModelResponseData();
        serviceModelResponseDataOne.setDescription("test-Description");
        serviceModelResponseDataOne.setId("test-ID");
        serviceModelResponseDataOne.setName("testnamea");
        serviceModelResponseDataOne.setService_template_file_name("test-FileA");
        serviceModelResponseDataOne.setUpload_time("2018-02-13 16:51:22.249405");
        responseObjects.add(serviceModelResponseDataOne);
        final ServiceModelResponseData serviceModelResponseDataTwo = new ServiceModelResponseData();
        serviceModelResponseDataTwo.setDescription("test-Description");
        serviceModelResponseDataTwo.setId("test-ID");
        serviceModelResponseDataTwo.setName("testnameb");
        serviceModelResponseDataTwo.setService_template_file_name("test-FileName");
        serviceModelResponseDataTwo.setUpload_time("2018-01-14 14:58:37.712993");
        responseObjects.add(serviceModelResponseDataTwo);
        final ServiceModelResponseData serviceModelResponseDataThree = new ServiceModelResponseData();
        serviceModelResponseDataThree.setDescription("test-Description");
        serviceModelResponseDataThree.setId("test-ID");
        serviceModelResponseDataThree.setName("testnamec");
        serviceModelResponseDataThree.setService_template_file_name("test-FileName");
        serviceModelResponseDataThree.setUpload_time("2018-02-13 16:51:23.249405");
        responseObjects.add(serviceModelResponseDataThree);
        final ServiceModelResponseData serviceModelResponseDataFour = new ServiceModelResponseData();
        serviceModelResponseDataFour.setDescription("test-Description");
        serviceModelResponseDataFour.setId("test-ID");
        serviceModelResponseDataFour.setName("testnamed");
        serviceModelResponseDataFour.setService_template_file_name("test-FileName");
        serviceModelResponseDataFour.setUpload_time("2018-01-15 14:58:37.712993");
        responseObjects.add(serviceModelResponseDataFour);
    }

    //"{\"name\": \"testnamea\","+"\"upload_time\": \"2018-02-14 16:51:23.249405\"}"
    @Test
    public void givenSetUpForServiceModelResponseData_whenFilterAvailable_thenFilterBasedOnName() {
        filter = new PaginationFilter("{\"name\": \"testnamea\"}");
        assertEquals(1, PaginationUtil.filter(responseObjects, filter).size());
        assertTrue(PaginationUtil.filter(responseObjects, filter).get(0).getName() == "testnamea");
    }

    @Test
    public void givenSetUpForServiceModelResponseData_whenFilterAvailable_thenFilterBasedOnUploadTime() {
        filter = new PaginationFilter("{\"upload_time\": \"2018-01-14 14:58:37.712993\"}");
        assertEquals(1, PaginationUtil.filter(responseObjects, filter).size());
        assertTrue(PaginationUtil.filter(responseObjects, filter).get(0).getUpload_time() == "2018-01-14 14:58:37.712993");
    }

    @Test
    public void givenSetUpForServiceModelResponseData_whenFilterAvailable_thenFilterBasedOnFileName() {
        filter = new PaginationFilter("{\"service_template_file_name\": \"test-FileName\"}");
        assertEquals(3, PaginationUtil.filter(responseObjects, filter).size());
        assertTrue(PaginationUtil.filter(responseObjects, filter).get(0).getService_template_file_name() == "test-FileName");
    }

    @Test
    public void givenSetUpForServiceModelResponseData_whenFilterNotAvailable_thenReturnOriginalList() {
        assertEquals(4, PaginationUtil.filter(responseObjects, filter).size());
        assertTrue(PaginationUtil.filter(responseObjects, filter).get(0).getName().equals("testnamea"));
        assertTrue(PaginationUtil.filter(responseObjects, filter).get(1).getUpload_time().equals("2018-01-14 14:58:37.712993"));
        assertTrue(PaginationUtil.filter(responseObjects, filter).get(2).getName().equals("testnamec"));
        assertTrue(PaginationUtil.filter(responseObjects, filter).get(3).getName().equals("testnamed"));
    }

    @Test
    public void givenSetUpForServiceModelResponseData_whenSortingOnName_thenSortDescendingOrder() {
        assertTrue(PaginationUtil.sort(responseObjects, "Name", "Desc").get(0).getName().equals("testnamed"));
    }

    @Test
    public void givenSetUpForServiceModelResponseData_whenSortingOnName_thenSortAscendingOrder() {
        assertTrue(PaginationUtil.sort(responseObjects, "Name", "Asc").get(0).getName().equals("testnamea"));
    }

    @Test
    public void givenSetUpForServiceModelResponseData_whenAttainingBatchOfObjects_thenProvideObjectsBasedOnLimits() {
        assertEquals(2, PaginationUtil.batch(responseObjects, 0, 2).size());
    }

}
