import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Main {

    private static final Logger LOG = LogManager.getLogger(Main.class);

    public static void main(String[] args) throws InterruptedException {
        while (true) {
            LOG.info("writing test log message!!!");
            Thread.sleep(1000);
        }
    }
}
