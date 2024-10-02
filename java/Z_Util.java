public class Z_Util {

    public static <E> E pickRandom(E[] array) {
        return array[(int) Math.floor(Math.random() * array.length)];
    }

}
