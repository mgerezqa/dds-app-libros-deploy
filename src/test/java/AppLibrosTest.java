import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class AppLibrosTest {



    @Test
    public void testAlgoQueDeberiaEstarBien() {
        Assertions.assertEquals(1, 1);
    }


    @Test
    public void testAlgoQueTambienDeberiaEstarBien() {
        Assertions.assertEquals(2, 2);
    }

    @Test
    public void testAlgoQueNoDeberiaEstarBien() {
        Assertions.assertEquals(3, 2);
    }

    @Test
    public void testNAlgoQueNoDeberiaEstarBien() {
        Assertions.assertEquals(3, 4);
    }


}
