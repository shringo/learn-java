public class C_ArraysAndConcating {

    public static void main(String[] args) {

        String[] places = {
            "POST",
            "Hamilton Library",
            "MSB",
            "BIL",
            "ARCH",
            "Campus Center",
            "SSCS"
        };

        String message = "You should go to " + Z_Util.pickRandom(places);
        System.out.println(message);

    }
}
